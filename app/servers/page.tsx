'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, Plus, MoreVertical, Activity, Power, RefreshCw, ShieldAlert, Terminal as TerminalIcon } from 'lucide-react';
import { db } from '@/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from '@/components/auth-provider';

export default function ServersPage() {
  const { user } = useAuth();
  const [servers, setServers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', ip: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'servers'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServers(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServer.name || !newServer.ip || !user) return;
    try {
      await addDoc(collection(db, 'servers'), {
        name: newServer.name,
        ip: newServer.ip,
        status: 'online',
        ownerId: user.uid,
      });
      setNewServer({ name: '', ip: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding server:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'servers', id));
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Servers</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Manage connected VPS nodes</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 rounded-xl font-mono text-sm tracking-widest transition-all"
        >
          <Plus className="w-4 h-4" /> Add Node
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-6 rounded-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-4 font-mono uppercase tracking-widest">Deploy New Node</h3>
          <form onSubmit={handleAddServer} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Hostname</label>
              <input
                type="text"
                value={newServer.name}
                onChange={e => setNewServer({ ...newServer, name: e.target.value })}
                className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                placeholder="e.g., prod-worker-01"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">IP Address</label>
              <input
                type="text"
                value={newServer.ip}
                onChange={e => setNewServer({ ...newServer, ip: e.target.value })}
                className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                placeholder="e.g., 192.168.1.100"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-xl font-mono text-sm tracking-widest transition-all h-[42px]"
            >
              Deploy
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 border border-slate-500/50 rounded-xl font-mono text-sm tracking-widest transition-all h-[42px]"
            >
              Cancel
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-xl">
            <p className="text-xs font-mono text-cyan-400 uppercase mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Quick Install Command
            </p>
            <code className="block p-3 bg-black rounded border border-cyan-500/10 text-slate-300 text-sm font-mono">
              curl -sSL https://install.fyor.dev/install.sh | bash
            </code>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <motion.div
            key={server.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden group hover:border-cyan-500/40 transition-colors"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                    <Server className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{server.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{server.ip}</p>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-cyan-400 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-slate-500 font-mono uppercase mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <span className={`text-sm font-mono uppercase ${server.status === 'online' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {server.status}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-slate-500 font-mono uppercase mb-1">Load</p>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-sm font-mono text-fuchsia-400">12%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <TerminalIcon className="w-3 h-3" /> Connect
                </button>
                <button className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(server.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
