'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Terminal as TerminalIcon, Server, Shield, Loader2, Play } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export default function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [sshConfig, setSshConfig] = useState({
    host: 'localhost',
    port: '22',
    username: 'root',
    password: '',
  });
  const socketRef = useRef<Socket | null>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

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
          <div className="w-80 border-r border-cyan-500/20 bg-black/60 p-6 space-y-6 overflow-y-auto">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4">Connection Details</h3>
            
            <div className="space-y-4">
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
            </div>

            <div className="pt-4">
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                Note: Passwords are used for the current session only and are not stored permanently.
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 bg-[#050505] relative">
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
