import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { parse } from 'url';
import si from 'systeminformation';
import { Client } from 'ssh2';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import net from 'net';

const execPromise = util.promisify(exec);

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use(express.json());
  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  // Realtime monitoring
  setInterval(async () => {
    try {
      const cpu = await si.currentLoad();
      const mem = await si.mem();
      const fsSize = await si.fsSize();
      const networkStats = await si.networkStats();
      
      const disk = fsSize[0] || { use: 0 };
      const net = networkStats[0] || { rx_sec: 0, tx_sec: 0 };

      io.emit('system-stats', {
        cpu: cpu.currentLoad,
        ram: (mem.active / mem.total) * 100,
        disk: disk.use,
        network: {
          rx: net.rx_sec,
          tx: net.tx_sec,
        },
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
    }
  }, 5000);

  // Terminal WebSocket
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    let sshClient: Client | null = null;
    let sshStream: any = null;
    let isMock = false;

    socket.on('terminal-connect', (config) => {
      sshClient = new Client();
      sshClient.on('ready', () => {
        socket.emit('terminal-output', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n');
        sshClient!.shell((err, stream) => {
          if (err) {
            socket.emit('terminal-output', '\r\n*** SSH SHELL ERROR: ' + err.message + ' ***\r\n');
            return;
          }
          sshStream = stream;
          stream.on('close', () => {
            socket.emit('terminal-output', '\r\n*** SSH CONNECTION CLOSED ***\r\n');
            sshClient!.end();
          }).on('data', (data: any) => {
            socket.emit('terminal-output', data.toString('utf-8'));
          });
        });
      }).on('error', (err) => {
        socket.emit('terminal-output', '\r\n*** SSH CONNECTION ERROR: ' + err.message + ' ***\r\n');
        socket.emit('terminal-output', '\r\n*** FALLING BACK TO MOCK TERMINAL ***\r\n');
        isMock = true;
        setupMockTerminal(socket);
      }).connect({
        host: config.host || 'localhost',
        port: config.port || 22,
        username: config.username || 'root',
        password: config.password || 'password',
        readyTimeout: 5000
      });
    });

    socket.on('terminal-input', (data) => {
      if (sshStream) {
        sshStream.write(data);
      } else if (isMock) {
        if (data === '\r') {
          socket.emit('terminal-output', '\r\nroot@fyor-os:~# ');
        } else if (data === '\u007f') {
          // Backspace
          socket.emit('terminal-output', '\b \b');
        } else {
          socket.emit('terminal-output', data);
        }
      }
    });

    socket.on('disconnect', () => {
      if (sshClient) {
        sshClient.end();
      }
    });
  });

  function setupMockTerminal(socket: any) {
    socket.emit('terminal-output', 'root@fyor-os:~# ');
  }

  server.get('/api/security/scan', async (req, res) => {
    try {
      const network = await si.networkConnections();
      const services = await si.services('nginx, mysql, postgresql, redis, docker, sshd');
      const users = await si.users();
      
      // Basic security checks
      const openPorts = network.filter(c => c.state === 'LISTEN').map(c => c.localPort);
      const activeUsers = users.map(u => u.user);
      
      res.json({
        openPorts: Array.from(new Set(openPorts)),
        activeUsers,
        services: services.map(s => ({ name: s.name, running: s.running })),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to scan security' });
    }
  });

  server.get('/api/system-info', async (req, res) => {
    try {
      const cpu = await si.cpu();
      const mem = await si.mem();
      const os = await si.osInfo();
      const disk = await si.fsSize();
      const processes = await si.processes();
      
      res.json({
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          speed: cpu.speed,
        },
        mem: {
          total: mem.total,
          free: mem.free,
          used: mem.used,
        },
        os: {
          platform: os.platform,
          distro: os.distro,
          release: os.release,
          hostname: os.hostname,
        },
        disk: disk.map(d => ({
          fs: d.fs,
          type: d.type,
          size: d.size,
          used: d.used,
          mount: d.mount,
        })),
        topProcesses: processes.list.slice(0, 5).map(p => ({
          name: p.name,
          cpu: p.cpu,
          mem: p.mem,
        })),
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch system info' });
    }
  });

  server.get('/api/network-info', async (req, res) => {
    try {
      const networkStats = await si.networkStats();
      const networkConnections = await si.networkConnections();
      const networkInterfaces = await si.networkInterfaces();
      
      res.json({
        stats: networkStats.map(s => ({
          iface: s.iface,
          rx_sec: s.rx_sec,
          tx_sec: s.tx_sec,
          operstate: s.operstate,
        })),
        connections: networkConnections.slice(0, 20).map(c => ({
          protocol: c.protocol,
          localAddress: c.localAddress,
          localPort: c.localPort,
          peerAddress: c.peerAddress,
          peerPort: c.peerPort,
          state: c.state,
        })),
        interfaces: networkInterfaces.map(i => ({
          iface: i.iface,
          ip4: i.ip4,
          mac: i.mac,
          type: i.type,
          speed: i.speed,
        })),
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch network info' });
    }
  });

  server.get('/api/processes', async (req, res) => {
    try {
      const processes = await si.processes();
      res.json({
        all: processes.list.map(p => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu,
          mem: p.mem,
          user: p.user,
          state: p.state,
        })),
        summary: {
          total: processes.all,
          running: processes.running,
          blocked: processes.blocked,
          sleeping: processes.sleeping,
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch processes' });
    }
  });

  server.post('/api/kill-process', async (req, res) => {
    const { pid } = req.body || {};
    if (!pid || isNaN(parseInt(pid))) return res.status(400).json({ error: 'Valid PID is required' });
    
    try {
      // Execute real kill command
      await execPromise(`kill -9 ${parseInt(pid)}`);
      res.json({ success: true, message: `Process ${pid} has been terminated.` });
    } catch (err: any) {
      console.error('Failed to kill process:', err);
      res.status(500).json({ error: err.message || 'Failed to kill process' });
    }
  });

  server.get('/api/services', async (req, res) => {
    try {
      // We'll fetch some common services to monitor
      const commonServices = ['nginx', 'apache2', 'mysql', 'postgresql', 'docker', 'ssh', 'ufw', 'cron'];
      const services = await si.services(commonServices.join(','));
      res.json(services.map(s => ({
        name: s.name,
        running: s.running,
        startmode: s.startmode,
        pids: s.pids,
        cpu: s.cpu,
        mem: s.mem,
      })));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  // Check if a port is open
  const checkPort = (port: number, host = '127.0.0.1'): Promise<boolean> => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        resolve(false);
      });
      socket.connect(port, host);
    });
  };

  // --- DATABASES API ---
  const databasesFile = path.join(process.cwd(), 'databases.json');
  let databasesData: any[] = [];

  if (fs.existsSync(databasesFile)) {
    try {
      databasesData = JSON.parse(fs.readFileSync(databasesFile, 'utf-8'));
    } catch (e) {
      console.error('Failed to parse databases.json', e);
    }
  } else {
    fs.writeFileSync(databasesFile, JSON.stringify(databasesData, null, 2));
  }

  server.get('/api/databases', async (req, res) => {
    try {
      // Check if ports are open for the databases
      for (let db of databasesData) {
        let port = 3306;
        if (db.type === 'PostgreSQL') port = 5432;
        else if (db.type === 'MongoDB') port = 27017;
        else if (db.type === 'Redis') port = 6379;

        const isOpen = await checkPort(port);
        db.status = isOpen ? 'Healthy' : 'Offline';
        if (isOpen && db.connections === undefined) {
          db.connections = Math.floor(Math.random() * 20) + 1; // Mock connections
        }
      }

      res.json(databasesData);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch databases' });
    }
  });

  server.post('/api/databases', async (req, res) => {
    const { name, type, username, password } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

    if (databasesData.some(db => db.name === name)) {
      return res.status(400).json({ error: 'Database already exists' });
    }

    try {
      // In a real environment, you would execute actual SQL commands here
      // e.g., mysql -u root -p password -e "CREATE DATABASE ${name}; CREATE USER '${username}'@'localhost' IDENTIFIED BY '${password}'; GRANT ALL PRIVILEGES ON ${name}.* TO '${username}'@'localhost';"
      
      const newDb = {
        id: Date.now().toString(),
        name,
        type,
        version: 'Latest',
        size: '0 MB',
        status: 'Healthy',
        connections: 0,
        username,
        password // In a real app, don't store plain text passwords if possible, or encrypt them
      };

      databasesData.push(newDb);
      fs.writeFileSync(databasesFile, JSON.stringify(databasesData, null, 2));
      res.json({ success: true, database: newDb });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create database' });
    }
  });

  server.delete('/api/databases/:id', async (req, res) => {
    const { id } = req.params;
    const db = databasesData.find(d => d.id === id);
    
    if (!db) return res.status(404).json({ error: 'Database not found' });

    try {
      // In a real environment, execute actual SQL commands to drop the database and user
      // e.g., mysql -e "DROP DATABASE ${db.name}; DROP USER '${db.username}'@'localhost';"
      
      databasesData = databasesData.filter(d => d.id !== id);
      fs.writeFileSync(databasesFile, JSON.stringify(databasesData, null, 2));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete database' });
    }
  });

  // --- FTP API ---
  const ftpFile = path.join(process.cwd(), 'ftp.json');
  let ftpData: any[] = [
    { id: '1', username: 'fyor_dev_ftp', path: '/www/wwwroot/fyor.dev', status: 'active', quota: 'Unlimited', usage: '1.2 GB' },
    { id: '2', username: 'api_fyor_ftp', path: '/www/wwwroot/api.fyor.dev', status: 'active', quota: '10 GB', usage: '450 MB' },
  ];

  if (fs.existsSync(ftpFile)) {
    try {
      ftpData = JSON.parse(fs.readFileSync(ftpFile, 'utf-8'));
    } catch (e) {
      console.error('Failed to parse ftp.json', e);
    }
  } else {
    fs.writeFileSync(ftpFile, JSON.stringify(ftpData, null, 2));
  }

  server.get('/api/ftp', (req, res) => {
    res.json(ftpData);
  });

  server.post('/api/ftp', (req, res) => {
    const { username, password, path: ftpPath, quota } = req.body;
    if (!username || !password || !ftpPath) {
      return res.status(400).json({ error: 'Username, password, and path are required' });
    }

    if (ftpData.some(f => f.username === username)) {
      return res.status(400).json({ error: 'FTP username already exists' });
    }

    const newFtp = {
      id: Date.now().toString(),
      username,
      password, // In a real app, use system commands to create the user
      path: ftpPath,
      quota: quota || 'Unlimited',
      usage: '0 B',
      status: 'active'
    };

    ftpData.push(newFtp);
    fs.writeFileSync(ftpFile, JSON.stringify(ftpData, null, 2));
    res.json({ success: true, ftp: newFtp });
  });

  server.patch('/api/ftp/:id', (req, res) => {
    const { id } = req.params;
    const { password, status, quota } = req.body;
    
    const ftpIndex = ftpData.findIndex(f => f.id === id);
    if (ftpIndex === -1) return res.status(404).json({ error: 'FTP account not found' });

    if (password) ftpData[ftpIndex].password = password;
    if (status) ftpData[ftpIndex].status = status;
    if (quota) ftpData[ftpIndex].quota = quota;
    
    fs.writeFileSync(ftpFile, JSON.stringify(ftpData, null, 2));
    res.json({ success: true, ftp: ftpData[ftpIndex] });
  });

  server.delete('/api/ftp/:id', (req, res) => {
    const { id } = req.params;
    ftpData = ftpData.filter(f => f.id !== id);
    fs.writeFileSync(ftpFile, JSON.stringify(ftpData, null, 2));
    res.json({ success: true });
  });

  // --- AUTOMATION API ---
  const automationFile = path.join(process.cwd(), 'automation.json');
  let automationData: any[] = [
    { id: 1, name: 'Auto-restart Nginx', condition: 'CPU > 90% for 5m', action: 'systemctl restart nginx', status: 'active', icon: 'Activity' },
    { id: 2, name: 'Clear Cache on High RAM', condition: 'RAM > 90%', action: 'sync; echo 3 > /proc/sys/vm/drop_caches', status: 'active', icon: 'Server' },
    { id: 3, name: 'Reboot on Kernel Panic', condition: 'System Unresponsive', action: 'reboot -f', status: 'paused', icon: 'Zap' },
    { id: 4, name: 'Scale Workers', condition: 'Traffic > 10k req/s', action: 'docker-compose scale web=5', status: 'active', icon: 'Globe' },
  ];

  if (fs.existsSync(automationFile)) {
    try {
      automationData = JSON.parse(fs.readFileSync(automationFile, 'utf-8'));
    } catch (e) {
      console.error('Failed to parse automation.json', e);
    }
  } else {
    fs.writeFileSync(automationFile, JSON.stringify(automationData, null, 2));
  }

  server.get('/api/automation', (req, res) => {
    res.json(automationData);
  });

  server.post('/api/automation', (req, res) => {
    const { name, condition, action, icon } = req.body;
    if (!name || !condition || !action) return res.status(400).json({ error: 'Missing required fields' });

    const newRule = {
      id: Date.now(),
      name,
      condition,
      action,
      icon: icon || 'Zap',
      status: 'active'
    };

    automationData.push(newRule);
    fs.writeFileSync(automationFile, JSON.stringify(automationData, null, 2));
    res.json({ success: true, rule: newRule });
  });

  server.patch('/api/automation/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const ruleIndex = automationData.findIndex(r => r.id.toString() === id.toString());
    if (ruleIndex === -1) return res.status(404).json({ error: 'Rule not found' });

    if (status) automationData[ruleIndex].status = status;
    
    fs.writeFileSync(automationFile, JSON.stringify(automationData, null, 2));
    res.json({ success: true, rule: automationData[ruleIndex] });
  });

  server.delete('/api/automation/:id', (req, res) => {
    const { id } = req.params;
    automationData = automationData.filter(r => r.id.toString() !== id.toString());
    fs.writeFileSync(automationFile, JSON.stringify(automationData, null, 2));
    res.json({ success: true });
  });

  server.post('/api/manage-service', async (req, res) => {
    const { name, action } = req.body || {};
    if (!name || !action) return res.status(400).json({ error: 'Service name and action are required' });
    
    // Validate action to prevent command injection
    const validActions = ['start', 'stop', 'restart', 'enable', 'disable', 'status'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Validate service name to prevent command injection
    const serviceNameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!serviceNameRegex.test(name)) {
      return res.status(400).json({ error: 'Invalid service name' });
    }

    try {
      // Execute real systemctl command
      await execPromise(`systemctl ${action} ${name}`);
      res.json({ success: true, message: `Service '${name}' ${action}ed successfully.` });
    } catch (err: any) {
      console.error(`Failed to ${action} service ${name}:`, err);
      res.status(500).json({ error: err.message || `Failed to ${action} service` });
    }
  });

  server.post('/api/marketplace/deploy', async (req, res) => {
    const { appId, appName } = req.body || {};
    if (!appId) return res.status(400).json({ error: 'App ID is required' });
    
    // Validate appId to prevent command injection
    const appIdRegex = /^[a-zA-Z0-9._-]+$/;
    if (!appIdRegex.test(appId)) {
      return res.status(400).json({ error: 'Invalid App ID' });
    }

    try {
      // Execute real apt-get install in the background
      execPromise(`DEBIAN_FRONTEND=noninteractive apt-get install -y ${appId}`).catch(err => {
        console.error(`Failed to install ${appId}:`, err);
      });

      res.json({ 
        success: true, 
        message: `Deployment of ${appName} started in the background.`,
        containerId: Math.random().toString(36).substring(7)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to start deployment' });
    }
  });

  server.post('/api/security/audit', async (req, res) => {
    try {
      // Fetch real auth logs from the system
      let logsStr = '';
      try {
        const { stdout } = await execPromise('tail -n 50 /var/log/auth.log 2>/dev/null || journalctl -n 50 -u ssh --no-pager 2>/dev/null');
        logsStr = stdout;
      } catch (e) {
        logsStr = 'Could not read /var/log/auth.log or journalctl. Ensure you are running as root.';
      }
      
      const logs = logsStr.split('\n').filter(line => line.trim() !== '').reverse();
      res.json({ logs: logs.length > 0 ? logs : ["No recent security logs found."] });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch security logs' });
    }
  });

  server.post('/api/security/block-ip', async (req, res) => {
    const { ip } = req.body || {};
    if (!ip) return res.status(400).json({ error: 'IP address is required' });

    // Basic IP validation to prevent command injection
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({ error: 'Invalid IP address format' });
    }

    try {
      // Execute real UFW command
      await execPromise(`ufw deny from ${ip}`);
      res.json({ success: true, message: `IP Address ${ip} has been blocked by UFW firewall.` });
    } catch (err: any) {
      console.error('Failed to block IP:', err);
      res.status(500).json({ error: err.message || 'Failed to block IP' });
    }
  });

  // Autonomous Agent State & Background Task
  const autonomousLogFile = path.join(process.cwd(), 'autonomous.log');
  let autonomousState = {
    enabled: true,
    mode: 'aggressive',
    lastAction: { type: 'System Boot', target: 'system', timestamp: new Date().toISOString(), reason: 'Initial startup' },
    healthScore: 100,
    uptime: '0m'
  };

  // Background monitoring loop
  setInterval(async () => {
    if (!autonomousState.enabled) return;
    try {
      const cpu = await si.currentLoad();
      const mem = await si.mem();
      const memUsedPercent = (mem.used / mem.total) * 100;
      
      let newHealth = 100;
      if (cpu.currentLoad > 80) newHealth -= 20;
      if (memUsedPercent > 85) newHealth -= 20;
      autonomousState.healthScore = newHealth;

      const timeStr = new Date().toLocaleTimeString();
      let logMsg = null;

      if (cpu.currentLoad > 90) {
        logMsg = { id: Date.now().toString(), time: timeStr, type: 'warning', message: `High CPU load detected: ${cpu.currentLoad.toFixed(1)}%. Monitoring processes.` };
        autonomousState.lastAction = { type: 'Resource Warning', target: 'CPU', timestamp: new Date().toISOString(), reason: 'Load > 90%' };
      } else if (memUsedPercent > 90) {
        logMsg = { id: Date.now().toString(), time: timeStr, type: 'warning', message: `High Memory usage: ${memUsedPercent.toFixed(1)}%. Consider clearing cache.` };
        autonomousState.lastAction = { type: 'Resource Warning', target: 'Memory', timestamp: new Date().toISOString(), reason: 'Usage > 90%' };
      }

      if (logMsg) {
        fs.appendFileSync(autonomousLogFile, JSON.stringify(logMsg) + '\n');
      }
    } catch (e) {
      console.error('Autonomous monitor error:', e);
    }
  }, 60000); // Check every minute

  server.get('/api/autonomous/status', async (req, res) => {
    try {
      const time = await si.time();
      const uptimeSecs = time.uptime;
      const days = Math.floor(uptimeSecs / 86400);
      const hours = Math.floor((uptimeSecs % 86400) / 3600);
      const mins = Math.floor((uptimeSecs % 3600) / 60);
      autonomousState.uptime = `${days}d ${hours}h ${mins}m`;
      res.json(autonomousState);
    } catch (e) {
      res.json(autonomousState);
    }
  });

  server.get('/api/autonomous/logs', (req, res) => {
    try {
      if (fs.existsSync(autonomousLogFile)) {
        const fileContent = fs.readFileSync(autonomousLogFile, 'utf-8');
        const logs = fileContent.split('\n').filter(l => l.trim()).map(l => JSON.parse(l)).reverse().slice(0, 50);
        res.json(logs);
      } else {
        res.json([{ id: 'init', time: new Date().toLocaleTimeString(), type: 'info', message: 'Autonomous Core initialized. Monitoring active.' }]);
      }
    } catch (e) {
      res.json([]);
    }
  });

  server.get('/api/system-logs', async (req, res) => {
    try {
      // Try to get some real logs, fallback to mock if fails
      const { stdout } = await execPromise('tail -n 50 /var/log/syslog 2>/dev/null || journalctl -n 50 --no-pager 2>/dev/null || echo "Mock: System initialized\nMock: Nginx started\nMock: Database connection established"');
      const logs = stdout.split('\n').filter(l => l.trim()).map((line, i) => ({
        id: i.toString(),
        timestamp: new Date().toISOString(),
        message: line,
        source: 'system'
      }));
      res.json(logs);
    } catch (e) {
      res.json([{ id: '1', timestamp: new Date().toISOString(), message: 'Error reading system logs', source: 'error' }]);
    }
  });

  server.get('/api/war-room/attacks', async (req, res) => {
    try {
      // Parse real failed SSH attempts to find attackers
      const { stdout } = await execPromise('grep "Failed password" /var/log/auth.log 2>/dev/null | tail -n 20 || journalctl -u ssh --no-pager 2>/dev/null | grep "Failed password" | tail -n 20');
      
      const attacks: any[] = [];
      const lines = stdout.split('\n').filter(l => l.trim() !== '');
      
      lines.forEach((line, index) => {
        // Extract IP using regex
        const ipMatch = line.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/);
        if (ipMatch) {
          const ip = ipMatch[0];
          // Generate deterministic pseudo-random coordinates based on IP string
          const hash = ip.split('.').reduce((acc, val) => acc + parseInt(val), 0);
          const lat = (hash % 180) - 90;
          const lng = ((hash * 2) % 360) - 180;
          
          attacks.push({
            id: index.toString(),
            origin: ip,
            coords: [lng, lat], // [longitude, latitude]
            target: 'SSH',
            intensity: Math.floor((hash % 50) + 50), // 50-100
            timestamp: new Date().toISOString()
          });
        }
      });

      if (attacks.length === 0) {
        // Fallback if no real attacks found
        attacks.push({ id: 'safe', origin: 'No recent attacks', coords: [0, 0], target: 'None', intensity: 0, timestamp: new Date().toISOString() });
      }

      res.json(attacks.reverse().slice(0, 10)); // Return latest 10
    } catch (e) {
      res.json([{ id: 'error', origin: 'Log read error', coords: [0, 0], target: 'System', intensity: 0, timestamp: new Date().toISOString() }]);
    }
  });

  // Tamagotchi State (Persistent)
  const tamagotchiFile = path.join(process.cwd(), 'tamagotchi.json');
  let tamagotchiState = {
    level: 1,
    xp: 0,
    xpToNext: 100,
    mood: 'happy',
    happiness: 100,
    energy: 100,
    hunger: 0,
    name: 'Fyor-kun'
  };

  // Load state if exists
  if (fs.existsSync(tamagotchiFile)) {
    try {
      tamagotchiState = JSON.parse(fs.readFileSync(tamagotchiFile, 'utf-8'));
    } catch (e) {
      console.error('Failed to load tamagotchi state');
    }
  }

  const saveTamagotchi = () => {
    fs.writeFileSync(tamagotchiFile, JSON.stringify(tamagotchiState));
  };

  server.get('/api/tamagotchi/status', (req, res) => {
    res.json(tamagotchiState);
  });

  server.post('/api/tamagotchi/interact', (req, res) => {
    const { action } = req.body || {};
    if (action === 'pet') {
      tamagotchiState.happiness = Math.min(100, tamagotchiState.happiness + 5);
      tamagotchiState.xp += 10;
    } else if (action === 'feed') {
      tamagotchiState.hunger = Math.max(0, tamagotchiState.hunger - 10);
      tamagotchiState.energy = Math.min(100, tamagotchiState.energy + 5);
      tamagotchiState.xp += 15;
    }
    
    if (tamagotchiState.xp >= tamagotchiState.xpToNext) {
      tamagotchiState.level += 1;
      tamagotchiState.xp -= tamagotchiState.xpToNext;
      tamagotchiState.xpToNext = Math.floor(tamagotchiState.xpToNext * 1.2);
    }
    
    saveTamagotchi();
    res.json(tamagotchiState);
  });

  server.post('/api/ssl/install', async (req, res) => {
    const { domain, email } = req.body || {};
    if (!domain) return res.status(400).json({ error: 'Domain is required' });
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    const certEmail = email || 'admin@' + domain;

    try {
      // 1. Check if certbot is installed
      try {
        await execPromise('certbot --version');
      } catch (e) {
        // Install certbot if missing
        await execPromise('apt-get update && apt-get install -y certbot python3-certbot-nginx');
      }

      // 2. Run certbot
      // We use --nginx plugin for automatic configuration
      // Note: This requires Nginx to be running and configured for the domain
      const { stdout, stderr } = await execPromise(`certbot --nginx -d ${domain} --non-interactive --agree-tos --email ${certEmail} --redirect`);
      
      console.log('Certbot output:', stdout);
      if (stderr) console.warn('Certbot warning:', stderr);

      // Update SSL status in websitesData
      const siteIndex = websitesData.findIndex(w => w.domain === domain);
      if (siteIndex !== -1) {
        websitesData[siteIndex].ssl = true;
        fs.writeFileSync(websitesFile, JSON.stringify(websitesData, null, 2));
      }

      res.json({ 
        success: true, 
        message: `SSL certificate for ${domain} has been installed successfully.`,
        output: stdout
      });
    } catch (err: any) {
      console.error('SSL Installation failed:', err);
      res.status(500).json({ 
        error: 'SSL Installation failed. Ensure your domain points to this server and Nginx is configured.',
        details: err.message 
      });
    }
  });

  // --- WEBSITES API ---
  const websitesFile = path.join(process.cwd(), 'websites.json');
  let websitesData: any[] = [
    { id: '1', domain: 'fyor.dev', status: 'active', ssl: true, repo: 'fyor/landing', framework: 'Next.js', phpVersion: '8.2' },
    { id: '2', domain: 'api.fyor.dev', status: 'deploying', ssl: false, repo: 'fyor/api', framework: 'Node.js', phpVersion: '8.1' },
  ];

  if (fs.existsSync(websitesFile)) {
    try {
      websitesData = JSON.parse(fs.readFileSync(websitesFile, 'utf-8'));
    } catch (e) {
      console.error('Failed to parse websites.json', e);
    }
  } else {
    fs.writeFileSync(websitesFile, JSON.stringify(websitesData, null, 2));
  }

  server.get('/api/websites', (req, res) => {
    res.json(websitesData);
  });

  server.post('/api/websites', (req, res) => {
    const { domain, repo, framework, phpVersion } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain is required' });
    
    // Check if domain already exists
    if (websitesData.some(w => w.domain === domain)) {
      return res.status(400).json({ error: 'Domain already exists' });
    }
    
    const newWebsite = {
      id: Date.now().toString(),
      domain,
      status: 'active',
      ssl: false,
      repo: repo || '',
      framework: framework || 'Static',
      phpVersion: phpVersion || '8.2'
    };
    
    websitesData.push(newWebsite);
    fs.writeFileSync(websitesFile, JSON.stringify(websitesData, null, 2));
    res.json({ success: true, website: newWebsite });
  });

  server.delete('/api/websites/:id', (req, res) => {
    const { id } = req.params;
    websitesData = websitesData.filter(w => w.id !== id);
    fs.writeFileSync(websitesFile, JSON.stringify(websitesData, null, 2));
    res.json({ success: true });
  });

  // --- FILE MANAGER API ---
  
  const BASE_DIR = path.join(process.cwd(), 'wwwroot');
  if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

  // Helper to safely resolve paths
  const resolveSafePath = (targetPath: string) => {
    const resolved = path.resolve(BASE_DIR, targetPath.replace(/^\//, ''));
    if (!resolved.startsWith(BASE_DIR)) {
      throw new Error('Path traversal detected');
    }
    return resolved;
  };

  const UPLOAD_BASE = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(UPLOAD_BASE)) fs.mkdirSync(UPLOAD_BASE, { recursive: true });

  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      try {
        const targetPath = req.query.path || '/';
        const fullPath = resolveSafePath(targetPath as string);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req: any, file: any, cb: any) => {
      cb(null, file.originalname);
    }
  });
  const upload = multer({ storage });

  server.get('/api/files', async (req, res) => {
    try {
      const targetPath = (req.query.path as string) || '/';
      const fullPath = resolveSafePath(targetPath);
      
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'Directory not found' });
      }

      const stats = fs.statSync(fullPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Path is not a directory' });
      }

      const items = fs.readdirSync(fullPath);
      const filesList = items.map(item => {
        const itemPath = path.join(fullPath, item);
        try {
          const itemStats = fs.statSync(itemPath);
          const isDir = itemStats.isDirectory();
          const ext = isDir ? '' : path.extname(item).slice(1);
          
          // Format size
          let sizeStr = '-';
          if (!isDir) {
            const size = itemStats.size;
            if (size < 1024) sizeStr = size + ' B';
            else if (size < 1024 * 1024) sizeStr = (size / 1024).toFixed(1) + ' KB';
            else if (size < 1024 * 1024 * 1024) sizeStr = (size / (1024 * 1024)).toFixed(1) + ' MB';
            else sizeStr = (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
          }

          // Format permissions (e.g., 0755)
          const permissions = '0' + (itemStats.mode & parseInt('777', 8)).toString(8);

          return {
            id: Buffer.from(itemPath).toString('base64'),
            name: item,
            type: isDir ? 'folder' : 'file',
            size: sizeStr,
            modified: itemStats.mtime.toISOString().replace('T', ' ').substring(0, 19),
            permissions: permissions,
            owner: itemStats.uid.toString(),
            ext: ext
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      filesList.sort((a: any, b: any) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });

      res.json(filesList);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to read directory' });
    }
  });

  server.get('/api/files/content', (req, res) => {
    try {
      const targetPath = req.query.path as string;
      if (!targetPath) return res.status(400).json({ error: 'Path is required' });
      
      const fullPath = resolveSafePath(targetPath);
      if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });
      
      const stats = fs.statSync(fullPath);
      if (stats.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'File is too large to edit in browser (>5MB)' });
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      res.json({ content });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to read file' });
    }
  });

  server.post('/api/files/content', (req, res) => {
    try {
      const { path: targetPath, content } = req.body;
      if (!targetPath || content === undefined) return res.status(400).json({ error: 'Path and content are required' });
      
      const fullPath = resolveSafePath(targetPath);
      fs.writeFileSync(fullPath, content, 'utf-8');
      
      res.json({ success: true, message: 'File saved successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save file' });
    }
  });

  server.post('/api/files/create', (req, res) => {
    try {
      const { path: targetPath, type } = req.body;
      if (!targetPath || !type) return res.status(400).json({ error: 'Path and type are required' });
      
      const fullPath = resolveSafePath(targetPath);
      if (fs.existsSync(fullPath)) return res.status(400).json({ error: 'File or folder already exists' });

      if (type === 'folder') {
        fs.mkdirSync(fullPath, { recursive: true });
      } else {
        fs.writeFileSync(fullPath, '');
      }
      
      res.json({ success: true, message: `${type === 'folder' ? 'Folder' : 'File'} created successfully` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create item' });
    }
  });

  server.post('/api/files/rename', (req, res) => {
    try {
      const { oldPath, newPath } = req.body;
      if (!oldPath || !newPath) return res.status(400).json({ error: 'Old path and new path are required' });
      
      const fullOldPath = resolveSafePath(oldPath);
      const fullNewPath = resolveSafePath(newPath);
      
      if (!fs.existsSync(fullOldPath)) return res.status(404).json({ error: 'Source file not found' });
      if (fs.existsSync(fullNewPath)) return res.status(400).json({ error: 'Destination already exists' });

      fs.renameSync(fullOldPath, fullNewPath);
      res.json({ success: true, message: 'Item renamed successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to rename item' });
    }
  });

  server.post('/api/files/upload', upload.single('file'), (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      res.json({ success: true, message: 'File uploaded successfully', file: req.file });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to upload file' });
    }
  });

  server.delete('/api/files', (req, res) => {
    try {
      const { paths } = req.body;
      if (!paths || !Array.isArray(paths)) return res.status(400).json({ error: 'Paths array is required' });
      
      for (const targetPath of paths) {
        const fullPath = resolveSafePath(targetPath);
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      }
      
      res.json({ success: true, message: 'Items deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete items' });
    }
  });

  // --- DOMAINS & SSL API ---
  const domainsFile = path.join(process.cwd(), 'domains.json');
  let domainsData: any[] = [
    { id: '1', name: 'fyor-os.com', status: 'Active', ssl: true, sslExpiry: '2026-12-31', dnsStatus: 'Correct', ip: '1.2.3.4' },
    { id: '2', name: 'demo.fyor-os.com', status: 'Active', ssl: false, sslExpiry: null, dnsStatus: 'Correct', ip: '1.2.3.4' },
  ];

  if (fs.existsSync(domainsFile)) {
    try {
      domainsData = JSON.parse(fs.readFileSync(domainsFile, 'utf-8'));
    } catch (e) {
      console.error('Failed to parse domains.json', e);
    }
  } else {
    fs.writeFileSync(domainsFile, JSON.stringify(domainsData, null, 2));
  }

  server.get('/api/domains', (req, res) => {
    res.json(domainsData);
  });

  server.post('/api/domains', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Domain name is required' });
    
    const newDomain = {
      id: Date.now().toString(),
      name,
      status: 'Active',
      ssl: false,
      sslExpiry: null,
      dnsStatus: 'Checking',
      ip: '1.2.3.4'
    };
    
    domainsData.push(newDomain);
    fs.writeFileSync(domainsFile, JSON.stringify(domainsData, null, 2));
    res.json({ success: true, domain: newDomain });
  });

  server.delete('/api/domains/:id', (req, res) => {
    const { id } = req.params;
    domainsData = domainsData.filter(d => d.id !== id);
    fs.writeFileSync(domainsFile, JSON.stringify(domainsData, null, 2));
    res.json({ success: true });
  });

  server.post('/api/domains/ssl', async (req, res) => {
    const { id } = req.body;
    const domainIndex = domainsData.findIndex(d => d.id === id);
    if (domainIndex === -1) return res.status(404).json({ error: 'Domain not found' });

    try {
      // Simulate SSL issuance
      domainsData[domainIndex].ssl = true;
      domainsData[domainIndex].sslExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      fs.writeFileSync(domainsFile, JSON.stringify(domainsData, null, 2));
      res.json({ success: true, message: `SSL issued for ${domainsData[domainIndex].name}`, domain: domainsData[domainIndex] });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to issue SSL' });
    }
  });

  server.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
