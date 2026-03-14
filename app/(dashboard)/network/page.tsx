'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Shield, 
  Zap, 
  RefreshCw, 
  Search, 
  Filter,
  ExternalLink,
  Wifi,
  Lock,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

interface NetworkStats {
  iface: string;
  rx_sec: number;
  tx_sec: number;
  operstate: string;
}

interface Connection {
  protocol: string;
  localAddress: string;
  localPort: string;
  peerAddress: string;
  peerPort: string;
  state: string;
}

interface InterfaceInfo {
  iface: string;
  ip4: string;
  mac: string;
  type: string;
  speed: number | null;
}

export default function NetworkPage() {
  const [data, setData] = useState<{
    stats: NetworkStats[];
    connections: Connection[];
    interfaces: InterfaceInfo[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNetworkData = async () => {
    try {
      const res = await fetch('/api/network-info');
      const json = await res.json();
      setData(json);
      
      // Update history for chart
      const mainIface = json.stats[0];
      if (mainIface) {
        setHistory(prev => {
          const newPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rx: (mainIface.rx_sec / 1024).toFixed(2), // KB/s
            tx: (mainIface.tx_sec / 1024).toFixed(2), // KB/s
          };
          const updated = [...prev, newPoint].slice(-20);
          return updated;
        });
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch network data');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchNetworkData();
    };
    init();
    const interval = setInterval(fetchNetworkData, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredConnections = data?.connections.filter(c => 
    c.peerAddress.includes(searchQuery) || 
    c.localPort.toString().includes(searchQuery) ||
    c.protocol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
            <Globe className="w-8 h-8 text-cyan-400" />
            Network Analyzer
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Real-time traffic monitoring & active connections.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Traffic Live</span>
          </div>
          <button 
            onClick={() => { setIsLoading(true); fetchNetworkData(); }}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Traffic Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Inbound Traffic</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white font-mono">
              {data?.stats[0] ? (data.stats[0].rx_sec / 1024 / 1024).toFixed(2) : '0.00'}
            </h3>
            <span className="text-sm font-mono text-cyan-400">MB/s</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <Activity className="w-3 h-3" />
            <span>Peak: 12.4 MB/s</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-fuchsia-500/10 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-fuchsia-400" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Outbound Traffic</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white font-mono">
              {data?.stats[0] ? (data.stats[0].tx_sec / 1024 / 1024).toFixed(2) : '0.00'}
            </h3>
            <span className="text-sm font-mono text-fuchsia-400">MB/s</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <Activity className="w-3 h-3" />
            <span>Peak: 8.1 MB/s</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Connections</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white font-mono">
              {data?.connections.length || 0}
            </h3>
            <span className="text-sm font-mono text-amber-400">Sockets</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <Shield className="w-3 h-3" />
            <span>Encrypted: 85%</span>
          </div>
        </motion.div>
      </div>

      {/* Traffic Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Bandwidth Utilization (KB/s)
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">RX</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-fuchsia-500" />
              <span className="text-[10px] font-mono text-slate-400 uppercase">TX</span>
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val} KB`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="rx" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRx)" strokeWidth={2} />
              <Area type="monotone" dataKey="tx" stroke="#d946ef" fillOpacity={1} fill="url(#colorTx)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Connections List */}
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xs font-black text-white font-mono uppercase tracking-widest">Active Connections</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Filter by IP, Port, Protocol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-black/80 backdrop-blur z-10 border-b border-white/10">
                <tr>
                  <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Protocol</th>
                  <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Local Address</th>
                  <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Peer Address</th>
                  <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredConnections?.map((conn, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                        conn.protocol === 'tcp' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {conn.protocol}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      {conn.localAddress}:{conn.localPort}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        {conn.peerAddress}:{conn.peerPort}
                        {conn.peerAddress !== '0.0.0.0' && conn.peerAddress !== '::' && (
                          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors cursor-pointer" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-mono uppercase tracking-tighter ${
                        conn.state === 'ESTABLISHED' ? 'text-emerald-400' : 
                        conn.state === 'LISTEN' ? 'text-cyan-400' : 'text-slate-500'
                      }`}>
                        {conn.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interfaces & Security Sidebar */}
        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-white font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              Network Interfaces
            </h3>
            <div className="space-y-4">
              {data?.interfaces.map((iface, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white font-mono">{iface.iface}</span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">Online</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">IPv4</span>
                      <span className="text-slate-300">{iface.ip4}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">MAC</span>
                      <span className="text-slate-300 truncate max-w-[120px]">{iface.mac}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Speed</span>
                      <span className="text-slate-300">{iface.speed ? `${iface.speed} Mbps` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 to-amber-500/10 border border-rose-500/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-white font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              Security Alerts
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-mono text-slate-200 leading-tight">Multiple SSH attempts from 192.168.1.45 blocked.</p>
                  <span className="text-[8px] font-mono text-slate-500 uppercase">2 mins ago</span>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-mono text-slate-200 leading-tight">Firewall rule updated: Port 443 opened.</p>
                  <span className="text-[8px] font-mono text-slate-500 uppercase">1 hour ago</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-mono text-[10px] font-bold transition-all uppercase tracking-widest">
              View Security Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
