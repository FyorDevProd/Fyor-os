'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/components/auth-provider';
import { Clock, Plus, Play, Trash2, Edit, FileText, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CronPage() {
  const { isDemo } = useAuth();
  const [tasks, setTasks] = useState([
    { id: '1', name: 'Daily Backup', type: 'Shell Script', schedule: '0 2 * * *', status: 'active', lastRun: '2026-03-16 02:00:00', nextRun: '2026-03-17 02:00:00' },
    { id: '2', name: 'Clear Cache', type: 'Shell Script', schedule: '0 0 * * 0', status: 'active', lastRun: '2026-03-15 00:00:00', nextRun: '2026-03-22 00:00:00' },
    { id: '3', name: 'Sync Logs', type: 'Shell Script', schedule: '*/30 * * * *', status: 'inactive', lastRun: '2026-03-16 10:30:00', nextRun: '-' },
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center gap-3">
            <Clock className="w-8 h-8 text-cyan-400" />
            Scheduled Tasks (Cron)
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Manage automated scripts, backups, and recurring jobs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Task Form */}
        <div className="lg:col-span-1 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-widest border-b border-cyan-500/20 pb-4 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" /> Add Task
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Task Type</label>
              <select className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono">
                <option>Shell Script</option>
                <option>Backup Database</option>
                <option>Backup Site</option>
                <option>Backup Directory</option>
                <option>Fetch URL</option>
                <option>Free Memory</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Task Name</label>
              <input type="text" placeholder="e.g., Daily DB Backup" className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono" />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Execution Cycle</label>
              <div className="flex gap-2">
                <select className="flex-1 bg-black/50 border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono">
                  <option>Every Day</option>
                  <option>N Minutes</option>
                  <option>N Hours</option>
                  <option>Every Week</option>
                  <option>Every Month</option>
                  <option>Custom Cron</option>
                </select>
                <input type="text" placeholder="02:00" className="w-24 bg-black/50 border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-mono text-center" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Script Content</label>
              <textarea 
                rows={4} 
                placeholder="#!/bin/bash&#10;echo 'Running task...'" 
                className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2 text-sm text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono custom-scrollbar"
              />
            </div>

            <button 
              onClick={() => handleDemoAction('Add Task')}
              className="w-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-400 font-mono font-bold tracking-widest transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-cyan-500/20 bg-white/5 flex justify-between items-center">
            <h2 className="font-mono text-cyan-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Task List
            </h2>
            <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-slate-300 font-mono text-xs hover:bg-white/10 transition-colors flex items-center gap-2">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-black/60">
                  <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Schedule</th>
                  <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Last Run</th>
                  <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="font-mono text-sm text-slate-200">{task.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{task.type}</div>
                    </td>
                    <td className="p-4 text-sm text-cyan-400 font-mono">{task.schedule}</td>
                    <td className="p-4">
                      {task.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-mono">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-mono">
                      <div>{task.lastRun}</div>
                      <div className="text-slate-600">Next: {task.nextRun}</div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleDemoAction('Execute Task')} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Execute">
                        <Play className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDemoAction('View Logs')} className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors" title="Logs">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDemoAction('Edit Task')} className="p-1.5 text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 rounded transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDemoAction('Delete Task')} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
