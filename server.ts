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
    if (!pid) return res.status(400).json({ error: 'PID is required' });
    
    try {
      // Execute real kill command
      await execPromise(`kill -9 ${pid}`);
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

  server.get('/api/databases', async (req, res) => {
    try {
      const dbs = [
        { id: 1, name: 'MySQL / MariaDB', type: 'MySQL', port: 3306, version: 'Unknown', size: 'N/A', status: 'Checking', connections: 0, tables: [] },
        { id: 2, name: 'PostgreSQL', type: 'PostgreSQL', port: 5432, version: 'Unknown', size: 'N/A', status: 'Checking', connections: 0, tables: [] },
        { id: 3, name: 'MongoDB', type: 'MongoDB', port: 27017, version: 'Unknown', size: 'N/A', status: 'Checking', connections: 0, tables: [] },
        { id: 4, name: 'Redis', type: 'Redis', port: 6379, version: 'Unknown', size: 'N/A', status: 'Checking', connections: 0, tables: [] },
      ];

      for (let db of dbs) {
        const isOpen = await checkPort(db.port);
        db.status = isOpen ? 'Healthy' : 'Offline';
        if (isOpen) {
          // Try to get version if possible via systemctl or dpkg, but keep it simple for now
          db.connections = Math.floor(Math.random() * 20) + 1; // Mock connections since we don't have auth
        }
      }

      res.json(dbs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch databases' });
    }
  });

  server.post('/api/manage-service', async (req, res) => {
    const { name, action } = req.body || {};
    if (!name || !action) return res.status(400).json({ error: 'Service name and action are required' });
    
    // Validate action to prevent command injection
    const validActions = ['start', 'stop', 'restart', 'enable', 'disable', 'status'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
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

    try {
      // Execute real apt-get install in the background
      // Note: This assumes the appId is a valid apt package name (e.g., 'docker.io', 'redis-server')
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

  server.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
