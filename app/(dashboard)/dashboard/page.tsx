'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
  Cpu, MemoryStick, HardDrive, Activity, Server, Globe, 
  Container, AlertTriangle, Terminal as TerminalIcon, 
  ShieldCheck, Zap, Stethoscope, Wand2, ArrowUpRight, 
  CheckCircle2, Clock, Shield, ChevronRight, Sparkles,
  BrainCircuit, RefreshCw, Lightbulb, X
} from 'lucide-react';
import Link from 'next/link';
import { generateAIResponse } from '@/lib/gemini';
import { toast } from 'sonner';

import { AdBanner } from '@/components/ad-banner';

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || '';

const StatCard = ({ title, value, icon: Icon, color, suffix = '%', statsHistory }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-black/40 backdrop-blur-xl border border-white/5 hover:border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden group transition-all"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 sm:w-32 sm:h-32 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all duration-500`} />
    
    <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
      <div>
        <p className="text-slate-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl sm:text-4xl font-black text-white mt-1 tracking-tighter">
          {typeof value === 'number' ? value.toFixed(1) : value}
          <span className="text-xs sm:text-sm text-slate-500 ml-1 font-medium">{suffix}</span>
        </h3>
      </div>
      <div className={`p-2 sm:p-3 bg-${color}-500/10 rounded-xl sm:rounded-2xl border border-${color}-500/20 shadow-[0_0_15px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${color}-400`} />
      </div>
    </div>
    
    <div className="h-12 sm:h-16 mt-2 sm:mt-4 -mx-2 sm:-mx-4 -mb-4 sm:-mb-6 relative z-0 opacity-60 group-hover:opacity-100 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={statsHistory}>
          <defs>
            <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color === 'cyan' ? '#06b6d4' : color === 'fuchsia' ? '#d946ef' : '#10b981'} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={color === 'cyan' ? '#06b6d4' : color === 'fuchsia' ? '#d946ef' : '#10b981'} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey={title.toLowerCase()} 
            stroke={color === 'cyan' ? '#06b6d4' : color === 'fuchsia' ? '#d946ef' : '#10b981'} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#color${title})`} 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [statsHistory, setStatsHistory] = useState<any[]>([]);
  const [currentStats, setCurrentStats] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    network: { rx: 0, tx: 0 }
  });
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('system-stats', (data) => {
      setCurrentStats(data);
      setStatsHistory((prev) => {
        const newHistory = [...prev, { time: new Date().toLocaleTimeString(), ...data }];
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getAiAdvice = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze these server stats and provide 3 short, actionable performance or security tips:
      CPU: ${currentStats.cpu.toFixed(1)}%
      RAM: ${currentStats.ram.toFixed(1)}%
      Disk: ${currentStats.disk.toFixed(1)}%
      Network RX: ${(currentStats.network.rx / 1024).toFixed(2)} KB/s
      Network TX: ${(currentStats.network.tx / 1024).toFixed(2)} KB/s
      
      Format as a concise bulleted list.`;
      
      const advice = await generateAIResponse(prompt, "You are an AI Server Performance Advisor. Be concise and technical.");
      setAiAdvice(advice);
    } catch (error) {
      toast.error("Failed to get AI advice");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate Health Score (Gamification)
  const healthScore = Math.max(0, Math.round(100 - ((currentStats.cpu * 0.4) + (currentStats.ram * 0.4) + (currentStats.disk * 0.2))));
  const healthColor = healthScore > 80 ? 'text-emerald-400' : healthScore > 50 ? 'text-amber-400' : 'text-rose-400';
  const healthBg = healthScore > 80 ? 'bg-emerald-500/10 border-emerald-500/30' : healthScore > 50 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      
      {/* Header & Health Score */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-white">
            Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Center</span>
          </h1>
          <p className="text-slate-400 font-mono text-xs sm:text-sm mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Telemetry Active
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={getAiAdvice}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-white/10 rounded-xl text-xs font-bold font-mono text-white hover:border-white/20 transition-all group"
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <BrainCircuit className="w-4 h-4 text-fuchsia-400 group-hover:scale-110 transition-transform" />}
            AI ADVISOR
          </button>

          {/* Gamified Health Score */}
          <div className={`flex items-center gap-4 p-3 sm:p-4 rounded-2xl border backdrop-blur-md ${healthBg} transition-colors`}>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-black/20"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className={healthColor}
                  strokeDasharray={`${healthScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm sm:text-lg font-black font-mono ${healthColor}`}>{healthScore}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest">Server Health</p>
              <p className={`text-sm sm:text-base font-bold ${healthColor}`}>
                {healthScore > 80 ? 'Excellent' : healthScore > 50 ? 'Needs Attention' : 'Critical'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {aiAdvice && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/20 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setAiAdvice(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Performance Insights
                  <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">GEN AI</span>
                </h3>
                <div className="mt-3 text-slate-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                  {aiAdvice.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid: Core Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="CPU" value={currentStats.cpu} icon={Cpu} color="cyan" statsHistory={statsHistory} />
        <StatCard title="RAM" value={currentStats.ram} icon={MemoryStick} color="fuchsia" statsHistory={statsHistory} />
        <StatCard title="Disk" value={currentStats.disk} icon={HardDrive} color="emerald" statsHistory={statsHistory} />
        <StatCard 
          title="Network" 
          value={(currentStats.network.rx + currentStats.network.tx) / 1024 / 1024} 
          icon={Activity} 
          color="cyan" 
          suffix="MB/s" 
          statsHistory={statsHistory}
        />
      </div>

      {/* Advertisement Banner */}
      <AdBanner dataAdSlot="1234567890" />

      {/* Bento Grid: Secondary Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Quick Access (Mobile: Horizontal Scroll, Desktop: Grid) */}
        <div className="lg:col-span-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-widest">Quick Access</h3>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-3 sm:gap-4 pb-4 lg:pb-0 no-scrollbar snap-x flex-1">
            <Link href="/terminal" className="snap-start shrink-0 w-32 lg:w-auto flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/50 rounded-2xl transition-all group">
              <TerminalIcon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest">Terminal</span>
            </Link>
            <Link href="/ai-utilities" className="snap-start shrink-0 w-32 lg:w-auto flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50 rounded-2xl transition-all group relative">
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-full uppercase tracking-tighter border border-emerald-500/30">FREE</div>
              <Wand2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest">AI Tools</span>
            </Link>
            <Link href="/security-auditor" className="snap-start shrink-0 w-32 lg:w-auto flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-fuchsia-500/10 border border-white/5 hover:border-fuchsia-500/50 rounded-2xl transition-all group">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest">Audit</span>
            </Link>
            <Link href="/ai-log-doctor" className="snap-start shrink-0 w-32 lg:w-auto flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/50 rounded-2xl transition-all group relative">
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] font-black rounded-full uppercase tracking-tighter border border-amber-500/30">PRO</div>
              <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest">Log Doctor</span>
            </Link>
          </div>
        </div>

        {/* Active Resources */}
        <div className="lg:col-span-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-widest">Active Resources</h3>
            <Link href="/servers" className="text-[10px] sm:text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-widest">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1">
            <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl border border-blue-500/20 flex flex-col justify-between group hover:border-blue-500/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl text-blue-400"><Server className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                <ArrowUpRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter">12</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">Active Services</p>
              </div>
            </div>
            
            <div className="p-4 sm:p-5 bg-gradient-to-br from-fuchsia-500/10 to-transparent rounded-2xl border border-fuchsia-500/20 flex flex-col justify-between group hover:border-fuchsia-500/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-fuchsia-500/20 rounded-xl text-fuchsia-400"><Container className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                <ArrowUpRight className="w-4 h-4 text-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter">8</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">Docker Containers</p>
              </div>
            </div>
            
            <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl border border-emerald-500/20 flex flex-col justify-between group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Globe className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter">5</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">Live Websites</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Processes & Events & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Top Processes (Technical Data Grid Style) */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col lg:col-span-1">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-widest">Top Processes</h3>
            <Link href="/processes" className="text-[10px] sm:text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-widest">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[250px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Process</th>
                  <th className="pb-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-right">CPU</th>
                  <th className="pb-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-right">RAM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'nginx', cpu: '12.4%', mem: '150MB', color: 'text-cyan-400' },
                  { name: 'dockerd', cpu: '8.1%', mem: '450MB', color: 'text-blue-400' },
                  { name: 'mysqld', cpu: '5.2%', mem: '800MB', color: 'text-fuchsia-400' },
                  { name: 'redis-server', cpu: '2.0%', mem: '50MB', color: 'text-emerald-400' },
                ].map((proc, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className={`py-3 text-xs sm:text-sm font-mono font-bold ${proc.color}`}>{proc.name}</td>
                    <td className="py-3 text-xs sm:text-sm font-mono text-slate-300 text-right">{proc.cpu}</td>
                    <td className="py-3 text-xs sm:text-sm font-mono text-slate-400 text-right">{proc.mem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col lg:col-span-1">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <button className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all group">
              <Server className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest text-center">Restart Nginx</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-fuchsia-500/20 border border-white/10 hover:border-fuchsia-500/50 rounded-2xl transition-all group">
              <HardDrive className="w-6 h-6 text-fuchsia-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest text-center">Clear Cache</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-2xl transition-all group">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest text-center">Update System</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/50 rounded-2xl transition-all group">
              <AlertTriangle className="w-6 h-6 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest text-center">Reboot Server</span>
            </button>
          </div>
        </div>

        {/* Recent Events (Timeline Style) */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col lg:col-span-1">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              System Audit Log
            </h3>
            <Link href="/logs" className="text-[10px] sm:text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-widest">
              Full Logs <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-0 flex-1 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {[
              { time: '10:42 AM', msg: 'Nginx restarted successfully', type: 'info', icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
              { time: '09:15 AM', msg: 'High CPU usage detected (92%)', type: 'warn', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/20' },
              { time: '08:30 AM', msg: 'New container deployed: redis-cache', type: 'success', icon: Container, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
              { time: '02:10 AM', msg: 'Automated backup completed', type: 'success', icon: Shield, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20' },
            ].map((event, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-4 sm:pb-6">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white/10 bg-black text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className={`w-2 h-2 rounded-full ${event.bg}`} />
                </div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 sm:p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${event.color}`}>{event.type}</span>
                    <span className="text-[10px] font-mono text-slate-500">{event.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">{event.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
