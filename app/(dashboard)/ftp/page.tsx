'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth-provider';
import { 
  HardDrive, 
  Plus, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Lock, 
  FolderOpen, 
  Search, 
  Copy, 
  Sparkles, 
  BrainCircuit, 
  X, 
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { generateAIResponse } from '@/lib/gemini';

interface FTPAccount {
  id: string;
  username: string;
  path: string;
  status: string;
  quota: string;
  usage: string;
  password?: string;
}

export default function FTPPage() {
  const { isDemo } = useAuth();
  const [ftpAccounts, setFtpAccounts] = useState<FTPAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const [newFtp, setNewFtp] = useState({
    username: '',
    password: '',
    path: '/www/wwwroot/',
    quota: 'Unlimited'
  });

  const fetchFtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ftp');
      const data = await res.json();
      setFtpAccounts(data);
    } catch (err) {
      toast.error('Failed to fetch FTP accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFtp();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      toast.success('Simulation: FTP Account Created');
      setIsAddModalOpen(false);
      return;
    }

    try {
      const res = await fetch('/api/ftp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFtp)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('FTP Account created successfully');
        setIsAddModalOpen(false);
        fetchFtp();
        setNewFtp({ username: '', password: '', path: '/www/wwwroot/', quota: 'Unlimited' });
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDemo) {
      toast.success('Simulation: FTP Account Deleted');
      return;
    }

    if (!confirm('Are you sure you want to delete this FTP account?')) return;

    try {
      const res = await fetch(`/api/ftp/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('FTP Account deleted');
        fetchFtp();
      }
    } catch (err) {
      toast.error('Failed to delete FTP account');
    }
  };

  const getAiAdvice = async () => {
    setIsAiWorking(true);
    try {
      const prompt = `Analyze these FTP accounts and provide security and optimization advice: ${JSON.stringify(ftpAccounts)}. 
      Focus on path security, username patterns, and quota management. Keep it concise and professional.`;
      const advice = await generateAIResponse(prompt, "You are a senior server administrator and security expert.");
      setAiAdvice(advice);
    } catch (err) {
      toast.error('AI analysis failed');
    } finally {
      setIsAiWorking(false);
    }
  };

  const filteredAccounts = ftpAccounts.filter(acc => 
    acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center gap-3">
            <HardDrive className="w-10 h-10 text-cyan-400" />
            FTP Management
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Secure file transfer protocol management with AI insights.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={getAiAdvice}
            disabled={isAiWorking || ftpAccounts.length === 0}
            className="px-4 py-2 bg-fuchsia-500/10 border border-fuchsia-500/50 rounded-xl text-fuchsia-400 font-mono text-sm font-bold hover:bg-fuchsia-500/20 transition-all flex items-center gap-2"
          >
            {isAiWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            AI ADVISOR
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-xl text-cyan-400 font-mono text-sm font-bold hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> ADD FTP
          </button>
        </div>
      </div>

      {/* AI Advice Section */}
      <AnimatePresence>
        {aiAdvice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 border border-fuchsia-500/30 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2">
              <button onClick={() => setAiAdvice(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/30">
                <Sparkles className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  AI Security & Performance Insights
                </h3>
                <div className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {aiAdvice}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5">
          <h2 className="font-mono text-cyan-400 flex items-center gap-2 uppercase tracking-widest text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Active FTP Endpoints
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter by user or path..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/60">
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Username</th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Password</th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Document Root</th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Quota / Usage</th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-mono text-sm">Synchronizing FTP accounts...</p>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-mono text-sm">No FTP accounts found.</p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((ftp) => (
                  <tr key={ftp.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-mono text-sm text-cyan-400">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                          <HardDrive className="w-4 h-4 text-slate-400" />
                        </div>
                        {ftp.username}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded border border-white/10">********</span>
                        <button onClick={() => copyToClipboard('********')} className="text-slate-500 hover:text-cyan-400 transition-colors" title="Copy Password">
                          <Copy className="w-3 h-3" />
                        </button>
                        <button className="text-slate-500 hover:text-fuchsia-400 transition-colors" title="Change Password">
                          <Lock className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <FolderOpen className="w-3 h-3 text-emerald-400" />
                        {ftp.path}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>{ftp.usage}</span>
                          <span>{ftp.quota}</span>
                        </div>
                        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 w-1/3" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${
                        ftp.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ftp.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {ftp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ftp.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-white/10 bg-black/40 text-[10px] font-mono text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <span>{filteredAccounts.length} FTP accounts found</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pure-Ftpd Service Running
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span>FTP Port: <strong className="text-cyan-400">21</strong></span>
            <button className="text-cyan-500 hover:text-cyan-400 underline decoration-cyan-500/30 underline-offset-4">Change Port</button>
          </div>
        </div>
      </div>

      {/* Add FTP Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Create FTP Account
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">FTP Username</label>
                  <input 
                    type="text"
                    required
                    value={newFtp.username}
                    onChange={(e) => setNewFtp({...newFtp, username: e.target.value})}
                    placeholder="e.g. web_user"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">FTP Password</label>
                  <input 
                    type="password"
                    required
                    value={newFtp.password}
                    onChange={(e) => setNewFtp({...newFtp, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Document Root</label>
                  <input 
                    type="text"
                    required
                    value={newFtp.path}
                    onChange={(e) => setNewFtp({...newFtp, path: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Quota (MB)</label>
                  <input 
                    type="text"
                    value={newFtp.quota}
                    onChange={(e) => setNewFtp({...newFtp, quota: e.target.value})}
                    placeholder="Unlimited"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-mono text-sm font-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    CREATE ACCOUNT
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
