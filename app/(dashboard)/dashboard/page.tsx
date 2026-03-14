'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, MemoryStick, HardDrive, Activity, Server, Globe, Container, AlertTriangle } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || '';

const StatCard = ({ title, value, icon: Icon, color, suffix = '%', statsHistory }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-black/40 backdrop-blur-md border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden group"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`} />
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-white mt-1">
          {typeof value === 'number' ? value.toFixed(1) : value}
          <span className="text-sm text-slate-500 ml-1">{suffix}</span>
        </h3>
      </div>
      <div className={`p-3 bg-${color}-500/10 rounded-xl border border-${color}-500/20`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
    </div>
    
    <div className="h-16 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={statsHistory}>
          <defs>
            <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color === 'cyan' ? '#06b6d4' : color === 'fuchsia' ? '#d946ef' : '#10b981'} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color === 'cyan' ? '#06b6d4' : color === 'fuchsia' ? '#d946ef' : '#10b981'} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey={title.toLowerCase()} 
            stroke={color === 'cyan' ? '#06b6d4' : color === 'fuchsia' ? '#d946ef' : '#10b981'} 
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">System Overview</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Realtime telemetry and status</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">All Systems Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 font-mono uppercase tracking-widest">Active Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Server className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-xs text-slate-400 font-mono uppercase">Active Services</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><Container className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-xs text-slate-400 font-mono uppercase">Running Containers</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><Globe className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-white">5</p>
                <p className="text-xs text-slate-400 font-mono uppercase">Active Websites</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 font-mono uppercase tracking-widest">Top Processes</h3>
          <div className="space-y-3">
            {[
              { name: 'nginx', cpu: '12%', mem: '150MB' },
              { name: 'docker', cpu: '8%', mem: '450MB' },
              { name: 'mysql', cpu: '5%', mem: '800MB' },
              { name: 'redis-server', cpu: '2%', mem: '50MB' },
            ].map((proc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="font-mono text-sm text-cyan-400">{proc.name}</span>
                <div className="flex gap-4 text-xs font-mono text-slate-400">
                  <span>CPU: {proc.cpu}</span>
                  <span>MEM: {proc.mem}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 font-mono uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Recent Events
          </h3>
          <div className="space-y-4">
            {[
              { time: '10:42 AM', msg: 'Nginx restarted successfully', type: 'info' },
              { time: '09:15 AM', msg: 'High CPU usage detected (92%)', type: 'warn' },
              { time: '08:30 AM', msg: 'New container deployed: redis-cache', type: 'success' },
              { time: '02:10 AM', msg: 'Automated backup completed', type: 'success' },
            ].map((event, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="text-xs font-mono text-slate-500 mt-0.5 whitespace-nowrap">{event.time}</div>
                <div className={`text-sm ${
                  event.type === 'warn' ? 'text-amber-400' : 
                  event.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  {event.msg}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
