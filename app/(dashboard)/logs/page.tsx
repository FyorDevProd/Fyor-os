'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollText, Bot, AlertTriangle, Play, CheckCircle2, XCircle } from 'lucide-react';

export default function LogsPage() {
  const [logs, setLogs] = useState([
    { id: 1, time: '10:42:01', level: 'info', service: 'nginx', msg: 'Started Nginx Web Server.' },
    { id: 2, time: '10:42:05', level: 'info', service: 'docker', msg: 'Container redis-cache started.' },
    { id: 3, time: '10:45:12', level: 'warn', service: 'system', msg: 'High memory usage detected: 85%' },
    { id: 4, time: '10:46:00', level: 'error', service: 'nginx', msg: 'nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)' },
  ]);

  const [aiAnalysis, setAiAnalysis] = useState<{ active: boolean; error: string; suggestion: string; command: string } | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Simulate AI detecting the error
    const errorLog = logs.find(l => l.level === 'error');
    if (errorLog && !aiAnalysis) {
      setTimeout(() => {
        setAiAnalysis({
          active: true,
          error: errorLog.msg,
          suggestion: 'Port 80 is already in use by another process. We need to identify the process and kill it, or change Nginx port.',
          command: 'sudo lsof -t -i:80 | xargs sudo kill -9 && sudo systemctl restart nginx'
        });
      }, 2000);
    }
  }, [logs, aiAnalysis]);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">System Logs</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Realtime event stream & AI analysis</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <ScrollText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Live Tail</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-1 bg-[#050505] border border-cyan-500/20 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <div className="p-4 border-b border-cyan-500/20 bg-black/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">/var/log/syslog</h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-slate-400">All Services</span>
              <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-slate-400">All Levels</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 hover:bg-white/5 px-2 py-1 rounded">
                <span className="text-slate-500 shrink-0">{log.time}</span>
                <span className={`shrink-0 w-16 uppercase text-xs font-bold pt-0.5 ${
                  log.level === 'error' ? 'text-rose-400' :
                  log.level === 'warn' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  [{log.level}]
                </span>
                <span className="text-cyan-400 shrink-0 w-20">{log.service}</span>
                <span className={log.level === 'error' ? 'text-rose-300' : 'text-slate-300'}>{log.msg}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

        <AnimatePresence>
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-96 shrink-0 flex flex-col gap-4"
            >
              <div className="bg-black/40 backdrop-blur-md border border-fuchsia-500/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(217,70,239,0.15)]">
                <div className="p-4 border-b border-fuchsia-500/20 bg-fuchsia-950/20 flex items-center gap-3">
                  <Bot className="w-5 h-5 text-fuchsia-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">AI Log Analyzer</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-mono text-rose-400 uppercase mb-1">Anomaly Detected</p>
                      <p className="text-sm text-slate-300">{aiAnalysis.error}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl">
                    <p className="text-xs font-mono text-fuchsia-400 uppercase mb-2">AI Diagnosis</p>
                    <p className="text-sm text-slate-200">{aiAnalysis.suggestion}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-mono text-slate-400 uppercase">Suggested Fix</p>
                    <div className="p-3 bg-black border border-cyan-500/30 rounded-xl font-mono text-xs text-cyan-400 break-all">
                      $ {aiAnalysis.command}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setAiAnalysis(null);
                      setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), level: 'info', service: 'system', msg: 'Auto-repair executed successfully. Nginx restarted.' }]);
                    }}
                    className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-xl font-mono text-sm tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Auto Repair
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
