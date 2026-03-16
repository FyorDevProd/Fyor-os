'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Terminal as TerminalIcon, Server, Shield, Loader2, Play, Trash2 } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export default function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [savedConnections, setSavedConnections] = useState<{name: string, host: string, port: string, username: string}[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fyor_ssh_connections');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [sshConfig, setSshConfig] = useState({
    name: 'Local Server',
    host: 'localhost',
    port: '22',
    username: 'root',
    password: '',
  });
  const socketRef = useRef<Socket | null>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const saveConnection = () => {
    const newSaved = [...savedConnections, { ...sshConfig }];
    setSavedConnections(newSaved);
    localStorage.setItem('fyor_ssh_connections', JSON.stringify(newSaved));
  };

  const deleteConnection = (index: number) => {
    const newSaved = savedConnections.filter((_, i) => i !== index);
    setSavedConnections(newSaved);
    localStorage.setItem('fyor_ssh_connections', JSON.stringify(newSaved));
  };

  const loadConnection = (conn: any) => {
    setSshConfig({ ...conn, password: '' });
  };

  const quickCommands = [
    { name: 'FYOR Menu', cmd: 'fyor\n' },
    { name: 'System Info', cmd: 'uname -a\n' },
    { name: 'Disk Usage', cmd: 'df -h\n' },
    { name: 'Memory', cmd: 'free -m\n' },
    { name: 'Processes', cmd: 'top -b -n 1 | head -n 20\n' },
    { name: 'Network', cmd: 'ip addr\n' },
    { name: 'Clear', cmd: 'clear\n' },
  ];

  const sendCommand = (cmd: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('terminal-input', cmd);
    }
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#000000',
        foreground: '#06b6d4',
        cursor: '#f0f',
        cursorAccent: '#000',
        selectionBackground: 'rgba(6, 182, 212, 0.3)',
        black: '#000000',
        red: '#ff0055',
        green: '#00ffaa',
        yellow: '#ffaa00',
        blue: '#00aaff',
        magenta: '#ff00ff',
        cyan: '#06b6d4',
        white: '#ffffff',
      },
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 14,
      lineHeight: 1.2,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectTerminal = () => {
    if (socketRef.current) return;
    setIsConnecting(true);
    setShowConfig(false);

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      socket.emit('terminal-connect', sshConfig);
    });

    socket.on('terminal-output', (data: string) => {
      if (xtermRef.current) {
        xtermRef.current.write(data);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      if (xtermRef.current) {
        xtermRef.current.write('\r\n\x1b[31m*** DISCONNECTED FROM SERVER ***\x1b[0m\r\n');
      }
    });

    if (xtermRef.current) {
      xtermRef.current.onData((data) => {
        socket.emit('terminal-input', data);
      });
    }
  };

  const disconnectTerminal = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      <div className="p-4 border-b border-cyan-500/20 bg-black/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-5 h-5 text-fuchsia-400" />
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Secure Shell</h2>
            <p className="text-xs text-slate-500 font-mono">{sshConfig.username}@{sshConfig.host}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded transition-colors ${showConfig ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            title="SSH Configuration"
          >
            <Server className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/30 border border-cyan-500/20 rounded text-xs font-mono">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400">AES-256-GCM</span>
          </div>
          {isConnected ? (
            <button
              onClick={disconnectTerminal}
              className="px-4 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 rounded font-mono text-xs uppercase tracking-widest transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectTerminal}
              disabled={isConnecting}
              className="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {showConfig && (
          <div className="w-80 border-r border-cyan-500/20 bg-black/60 p-6 space-y-6 overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4">Saved Connections</h3>
              <div className="space-y-2">
                {savedConnections.length === 0 && (
                  <p className="text-[10px] text-slate-600 font-mono italic">No saved connections</p>
                )}
                {savedConnections.map((conn, i) => (
                  <div key={i} className="group flex items-center justify-between bg-white/5 border border-white/10 rounded p-2 hover:border-cyan-500/50 transition-colors">
                    <button 
                      onClick={() => loadConnection(conn)}
                      className="flex-1 text-left"
                    >
                      <p className="text-[10px] font-bold text-white truncate">{conn.name || conn.host}</p>
                      <p className="text-[8px] text-slate-500 font-mono">{conn.username}@{conn.host}</p>
                    </button>
                    <button 
                      onClick={() => deleteConnection(i)}
                      className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-cyan-500/20" />

            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4">New Connection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Profile Name</label>
                <input
                  type="text"
                  value={sshConfig.name}
                  onChange={(e) => setSshConfig({ ...sshConfig, name: e.target.value })}
                  className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  placeholder="My Server"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Hostname / IP</label>
                <input
                  type="text"
                  value={sshConfig.host}
                  onChange={(e) => setSshConfig({ ...sshConfig, host: e.target.value })}
                  className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  placeholder="localhost"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Port</label>
                <input
                  type="text"
                  value={sshConfig.port}
                  onChange={(e) => setSshConfig({ ...sshConfig, port: e.target.value })}
                  className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  placeholder="22"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={sshConfig.username}
                  onChange={(e) => setSshConfig({ ...sshConfig, username: e.target.value })}
                  className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  placeholder="root"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={sshConfig.password}
                  onChange={(e) => setSshConfig({ ...sshConfig, password: e.target.value })}
                  className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  placeholder="••••••••"
                />
              </div>

              <button 
                onClick={saveConnection}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-mono text-slate-300 uppercase tracking-widest transition-colors"
              >
                Save Profile
              </button>
            </div>

            <div className="pt-4">
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                Note: Passwords are used for the current session only and are not stored permanently.
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-[#050505] relative">
          {isConnected && (
            <div className="p-2 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
              {quickCommands.map((q) => (
                <button
                  key={q.name}
                  onClick={() => sendCommand(q.cmd)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-mono text-slate-400 whitespace-nowrap transition-colors"
                >
                  {q.name}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex-1 p-4 relative">
            {!isConnected && !isConnecting && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 backdrop-blur-sm">
                <div className="text-center">
                  <TerminalIcon className="w-12 h-12 text-cyan-500/50 mx-auto mb-4" />
                  <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest">Terminal Offline</p>
                  <p className="text-slate-500 font-mono text-xs mt-2">Configure SSH and click connect</p>
                </div>
              </div>
            )}
            <div ref={terminalRef} className="w-full h-full terminal-container" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .terminal-container .xterm-viewport {
          background-color: transparent !important;
        }
        .terminal-container .xterm-screen {
          padding: 8px;
        }
      `}</style>
    </div>
  );
}
