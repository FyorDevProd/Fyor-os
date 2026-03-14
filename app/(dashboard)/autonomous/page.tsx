'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Activity, 
  BrainCircuit, 
  RefreshCw, 
  Settings2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Power,
  Gauge,
  History,
  Terminal,
  Sparkles,
  ArrowUpRight,
  Database,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';

interface AutoAction {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface AutoStatus {
  enabled: boolean;
  mode: string;
  lastAction: {
    type: string;
    target: string;
    timestamp: string;
    reason: string;
  };
  healthScore: number;
}

export default function AutonomousCorePage() {
  const { isDemo } = useAuth();
  const [status, setStatus] = useState<AutoStatus | null>(null);
  const [logs, setLogs] = useState<AutoAction[]>([]);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statusRes, logsRes] = await Promise.all([
        fetch('/api/autonomous/status'),
        fetch('/api/autonomous/logs')
      ]);
      const statusData = await statusRes.json();
      const logsData = await logsRes.json();
      setStatus(statusData);
      setLogs(logsData);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch autonomous data');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleAutoPilot = () => {
    if (isDemo) {
      toast.error('Access Denied', {
        description: 'Autonomous Core settings are locked in Demo Mode.'
      });
      return;
    }
    setIsAutoPilot(!isAutoPilot);
    toast.success(`Autonomous Core ${!isAutoPilot ? 'Enabled' : 'Disabled'}`, {
      description: !isAutoPilot ? 'System is now in Auto-Pilot mode.' : 'System returned to manual control.'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 flex items-center gap-3">
            <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
            Autonomous Core
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-2">FYOR OS Self-Healing & Predictive Intelligence Engine.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Core Status</span>
            <span className={`text-xs font-mono font-bold ${isAutoPilot ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isAutoPilot ? 'AUTONOMOUS ACTIVE' : 'MANUAL OVERRIDE'}
            </span>
          </div>
          <button 
            onClick={toggleAutoPilot}
            className={`relative w-16 h-8 rounded-full transition-all duration-500 p-1 ${isAutoPilot ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-rose-500/20 border-rose-500/50'} border`}
          >
            <motion.div 
              animate={{ x: isAutoPilot ? 32 : 0 }}
              className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${isAutoPilot ? 'bg-emerald-500' : 'bg-rose-500'}`}
            >
              <Power className="w-3 h-3 text-white" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: AI Decision Engine */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Brain Visualization */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BrainCircuit className="w-64 h-64 text-cyan-400" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                  <BrainCircuit className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Decision Engine</h2>
                  <p className="text-xs text-slate-500 font-mono">Analyzing system telemetry in real-time...</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Self-Healing Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Self-Healing</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">READY</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-mono text-slate-300">Last Action: Service Restart</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      <p className="text-[10px] font-mono text-slate-500">Target: <span className="text-white">nginx.service</span></p>
                      <p className="text-[10px] font-mono text-slate-500">Reason: <span className="text-rose-400 italic">502 Bad Gateway detected</span></p>
                    </div>
                  </div>
                </div>

                {/* Predictive Analysis */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Predictive</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">ANALYZING</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono text-slate-300">Disk Capacity Forecast</span>
                    </div>
                    <div className="pl-7">
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        />
                      </div>
                      <p className="text-[10px] font-mono text-slate-500">
                        Trend: <span className="text-orange-400">95% in 72 hours</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Live Telemetry Stream</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    <span className="text-[10px] font-mono text-emerald-400">SYNCED</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'CPU LOAD', val: '12.4%', icon: Activity },
                    { label: 'MEM USAGE', val: '4.2GB', icon: Database },
                    { label: 'NET I/O', val: '1.2MB/s', icon: Globe },
                    { label: 'IO WAIT', val: '0.02ms', icon: RefreshCw }
                  ].map((item, i) => (
                    <div key={i} className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <item.icon className="w-4 h-4 text-slate-500 mx-auto mb-2" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">{item.label}</span>
                      <span className="text-xs font-mono text-white font-bold">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Autonomous Action Logs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white tracking-tighter flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                Autonomous Action History
              </h3>
              <button className="text-[10px] font-mono text-slate-500 hover:text-white transition-all uppercase tracking-widest">Clear History</button>
            </div>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {logs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:border-cyan-500/30 transition-all"
                  >
                    <div className={`p-2 rounded-lg ${
                      log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {log.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                       log.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                       <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 font-mono">{log.message}</p>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{log.time}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-white transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Core Stats & Controls */}
        <div className="space-y-8">
          
          {/* Health Score Gauge */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 text-center space-y-6">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest">System Health Score</h3>
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-white/5 stroke-current" strokeWidth="6" fill="transparent" r="45" cx="50" cy="50" />
                <motion.circle 
                  className="text-cyan-400 stroke-current" 
                  strokeWidth="6" 
                  strokeDasharray="282.7" 
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 282.7 * (1 - 0.98) }}
                  strokeLinecap="round" 
                  fill="transparent" 
                  r="45" 
                  cx="50" 
                  cy="50" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-400 mb-2 animate-pulse" />
                <span className="text-5xl font-black text-white font-mono">98</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">Optimal</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Core is operating at peak efficiency. No critical interventions required.
            </p>
          </div>

          {/* Auto-Pilot Config */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-cyan-400" />
              Core Configuration
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs font-mono text-slate-400">Aggressive Healing</span>
                <div className="w-8 h-4 bg-cyan-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs font-mono text-slate-400">Auto-Scaling</span>
                <div className="w-8 h-4 bg-cyan-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs font-mono text-slate-400">Log Optimization</span>
                <div className="w-8 h-4 bg-slate-700 rounded-full relative">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl font-mono text-[10px] font-bold transition-all uppercase tracking-widest">
              Save Configuration
            </button>
          </div>

          {/* AI Terminal Output */}
          <div className="bg-black/60 border border-white/10 rounded-3xl p-6 space-y-4 font-mono">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Core Terminal</span>
            </div>
            <div className="text-[10px] space-y-1 text-slate-500">
              <p><span className="text-emerald-500">fyor@core:~$</span> tail -f /var/log/autonomous.log</p>
              <p className="text-slate-400">[14:25:01] Scanning system health...</p>
              <p className="text-slate-400">[14:25:02] CPU: 12.4% | RAM: 4.2GB</p>
              <p className="text-emerald-400">[14:25:03] All systems nominal.</p>
              <p className="text-slate-400">[14:25:05] Waiting for next cycle...</p>
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-3 bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Info } from 'lucide-react';
