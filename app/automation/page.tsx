'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Plus, Play, Pause, Trash2, Settings2, Activity, Server, Globe } from 'lucide-react';

export default function AutomationPage() {
  const [rules, setRules] = useState([
    { id: 1, name: 'Auto-restart Nginx', condition: 'CPU > 90% for 5m', action: 'systemctl restart nginx', status: 'active', icon: Activity },
    { id: 2, name: 'Clear Cache on High RAM', condition: 'RAM > 90%', action: 'sync; echo 3 > /proc/sys/vm/drop_caches', status: 'active', icon: Server },
    { id: 3, name: 'Reboot on Kernel Panic', condition: 'System Unresponsive', action: 'reboot -f', status: 'paused', icon: Zap },
    { id: 4, name: 'Scale Workers', condition: 'Traffic > 10k req/s', action: 'docker-compose scale web=5', status: 'active', icon: Globe },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Automation</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Autonomous rule engine</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/50 rounded-xl font-mono text-sm tracking-widest transition-all">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-black/40 backdrop-blur-md border rounded-2xl overflow-hidden group transition-all ${
              rule.status === 'active' ? 'border-cyan-500/30 hover:border-cyan-500/50' : 'border-slate-500/20 hover:border-slate-500/40 opacity-70'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${
                    rule.status === 'active' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                  }`}>
                    <rule.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{rule.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${rule.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className={`text-xs font-mono uppercase ${rule.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {rule.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-slate-500 font-mono uppercase mb-1">Condition</p>
                  <p className="text-sm font-mono text-amber-400">{rule.condition}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-slate-500 font-mono uppercase mb-1">Action</p>
                  <p className="text-sm font-mono text-fuchsia-400 truncate" title={rule.action}>$ {rule.action}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const newRules = [...rules];
                    newRules[i].status = rule.status === 'active' ? 'paused' : 'active';
                    setRules(newRules);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border ${
                    rule.status === 'active' 
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {rule.status === 'active' ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Enable</>}
                </button>
                <button className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg transition-colors">
                  <Settings2 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
