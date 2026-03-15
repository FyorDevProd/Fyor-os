'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Search, 
  Trash2, 
  RefreshCw, 
  ArrowUpDown, 
  Cpu, 
  Database, 
  User, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Terminal,
  Play,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';

interface Process {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  user: string;
  state: string;
}

interface ProcessSummary {
  total: number;
  running: number;
  blocked: number;
  sleeping: number;
}

export default function ProcessesPage() {
  const { isDemo } = useAuth();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [summary, setSummary] = useState<ProcessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Process; direction: 'asc' | 'desc' }>({
    key: 'cpu',
    direction: 'desc'
  });

  const fetchProcesses = async () => {
    try {
      const res = await fetch('/api/processes');
      const data = await res.json();
      setProcesses(data.all);
      setSummary(data.summary);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch processes');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchProcesses();
    };
    init();
    const interval = setInterval(fetchProcesses, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key: keyof Process) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedProcesses = [...processes].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredProcesses = sortedProcesses.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.pid.toString().includes(searchQuery) ||
    p.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const killProcess = async (pid: number, name: string) => {
    if (isDemo) {
      toast.success(`Simulation: Process ${name} terminated`, {
        description: `PID ${pid} was virtually killed in Demo Mode.`
      });
      setProcesses(prev => prev.filter(p => p.pid !== pid));
      return;
    }

    toast.promise(
      fetch('/api/kill-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid })
      }).then(res => res.json()),
      {
        loading: `Terminating process ${name} (PID: ${pid})...`,
        success: (data) => data.message,
        error: 'Failed to terminate process'
      }
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400" />
            Process Manager
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Monitor and manage running system processes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
            <div className="px-3 py-1 flex items-center gap-2 border-r border-white/10">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Total</span>
              <span className="text-xs font-mono text-white font-bold">{summary?.total || 0}</span>
            </div>
            <div className="px-3 py-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Running</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">{summary?.running || 0}</span>
            </div>
          </div>
          <button 
            onClick={() => { setIsLoading(true); fetchProcesses(); }}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search by name, PID, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
              <div className="w-2 h-2 rounded-full bg-emerald-400" /> Running
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
              <div className="w-2 h-2 rounded-full bg-slate-600" /> Sleeping
            </div>
          </div>
        </div>

        {/* Process Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-black/80 backdrop-blur z-10 border-b border-white/10">
              <tr>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('pid')}>
                  <div className="flex items-center gap-2">
                    PID {sortConfig.key === 'pid' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Process {sortConfig.key === 'name' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('cpu')}>
                  <div className="flex items-center gap-2">
                    CPU % {sortConfig.key === 'cpu' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('mem')}>
                  <div className="flex items-center gap-2">
                    Memory % {sortConfig.key === 'mem' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('user')}>
                  <div className="flex items-center gap-2">
                    User {sortConfig.key === 'user' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredProcesses.map((p, i) => (
                  <motion.tr 
                    key={p.pid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: Math.min(i * 0.01, 0.5) }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4 font-mono text-xs text-slate-500">{p.pid}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.state === 'running' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-600'}`} />
                        <span className="text-sm font-bold text-white font-mono truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-16 hidden sm:block">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(p.cpu * 10, 100)}%` }}
                            className={`h-full ${p.cpu > 50 ? 'bg-rose-500' : p.cpu > 20 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                          />
                        </div>
                        <span className={`text-xs font-mono font-bold ${p.cpu > 50 ? 'text-rose-400' : 'text-slate-300'}`}>
                          {p.cpu.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-16 hidden sm:block">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(p.mem * 10, 100)}%` }}
                            className={`h-full ${p.mem > 50 ? 'bg-rose-500' : p.mem > 20 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-300">
                          {p.mem.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <User className="w-3 h-3" />
                        {p.user}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => killProcess(p.pid, p.name)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Kill Process"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Avg CPU</p>
            <p className="text-sm font-bold text-white font-mono">
              {(processes.reduce((acc, p) => acc + p.cpu, 0) / (processes.length || 1)).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Avg Mem</p>
            <p className="text-sm font-bold text-white font-mono">
              {(processes.reduce((acc, p) => acc + p.mem, 0) / (processes.length || 1)).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Healthy</p>
            <p className="text-sm font-bold text-white font-mono">98%</p>
          </div>
        </div>
        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Zombie</p>
            <p className="text-sm font-bold text-white font-mono">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
