'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Container, Play, Square, Trash2, FileText, Plus, RefreshCw, Box } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export default function DockerPage() {
  const { isDemo } = useAuth();
  const [containers, setContainers] = useState([
    { id: 'c1', name: 'fyor-api', image: 'node:18-alpine', status: 'running', ports: '3000->3000/tcp', created: '2 days ago' },
    { id: 'c2', name: 'redis-cache', image: 'redis:alpine', status: 'running', ports: '6379->6379/tcp', created: '5 days ago' },
    { id: 'c3', name: 'postgres-db', image: 'postgres:15', status: 'exited', ports: '5432->5432/tcp', created: '1 week ago' },
  ]);

  const handleDemoAction = (action: string) => {
    if (isDemo) {
      toast.success(`Simulation: ${action}`, {
        description: `Action "${action}" was simulated in Demo Mode.`
      });
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Docker</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Manage containers and images</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleDemoAction('Sync Containers')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-mono text-sm tracking-widest transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Sync
          </button>
          <button 
            onClick={() => handleDemoAction('Deploy Container')}
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/50 rounded-xl font-mono text-sm tracking-widest transition-all"
          >
            <Plus className="w-4 h-4" /> Deploy
          </button>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cyan-950/30 border-b border-cyan-500/20">
                <th className="p-4 text-xs font-mono text-cyan-400 uppercase tracking-widest">Name</th>
                <th className="p-4 text-xs font-mono text-cyan-400 uppercase tracking-widest">Image</th>
                <th className="p-4 text-xs font-mono text-cyan-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-mono text-cyan-400 uppercase tracking-widest">Ports</th>
                <th className="p-4 text-xs font-mono text-cyan-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Box className={`w-5 h-5 ${c.status === 'running' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="font-bold text-slate-200">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-400">{c.image}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                      <span className={`text-xs font-mono uppercase ${c.status === 'running' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {c.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono text-cyan-400">{c.ports}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      {c.status === 'running' ? (
                        <button onClick={() => handleDemoAction('Stop Container')} className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors" title="Stop">
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleDemoAction('Start Container')} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors" title="Start">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDemoAction('View Logs')} className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors" title="Logs">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDemoAction('Delete Container')} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
