'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BrainCircuit,
  Info,
  ChevronRight,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { generateAIResponse } from '@/lib/gemini';

interface Domain {
  id: string;
  name: string;
  status: string;
  ssl: boolean;
  sslExpiry: string | null;
  dnsStatus: string;
  ip: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      setDomains(data);
    } catch (err) {
      toast.error('Failed to fetch domains');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDomain }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Domain added successfully');
        setNewDomain('');
        setIsAdding(false);
        fetchDomains();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add domain');
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('Are you sure you want to remove this domain?')) return;

    try {
      const res = await fetch(`/api/domains/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Domain removed successfully');
        fetchDomains();
      }
    } catch (err) {
      toast.error('Failed to remove domain');
    }
  };

  const handleIssueSSL = async (id: string) => {
    toast.info('Issuing SSL certificate...', { description: 'This may take a few moments.' });
    try {
      const res = await fetch('/api/domains/ssl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('SSL Certificate Issued', { description: `SSL is now active for ${data.domain.name}` });
        fetchDomains();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to issue SSL');
    }
  };

  const runAiAudit = async () => {
    setIsAiAnalyzing(true);
    setAiReport(null);
    try {
      const prompt = `Analyze these domains and their SSL/DNS status for a server control panel:
      ${JSON.stringify(domains)}
      
      Provide a professional security and configuration report. Identify missing SSL, DNS misconfigurations, or potential security risks. Suggest improvements.`;
      
      const response = await generateAIResponse(prompt, "You are an AI Web Infrastructure Expert.");
      setAiReport(response);
    } catch (err) {
      toast.error('AI Audit failed');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const filteredDomains = domains.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white flex items-center gap-4">
            <Globe className="w-10 h-10 lg:w-12 lg:h-12 text-cyan-500" />
            Domains <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-fuchsia-500">& SSL</span>
          </h1>
          <p className="text-slate-400 font-mono text-xs sm:text-sm mt-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            SECURE INFRASTRUCTURE MANAGEMENT
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={runAiAudit}
            disabled={isAiAnalyzing || domains.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold font-mono text-white transition-all disabled:opacity-50"
          >
            {isAiAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4 text-fuchsia-400" />}
            AI AUDIT
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-2xl text-sm font-bold font-mono text-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" />
            ADD DOMAIN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter domains..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-white/5">
              <RefreshCw className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
              <p className="text-slate-500 font-mono text-sm">Synchronizing domain data...</p>
            </div>
          ) : filteredDomains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-white/5 text-center">
              <Globe className="w-16 h-16 text-slate-800 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">No Domains Found</h3>
              <p className="text-slate-500 font-mono text-sm max-w-xs">Start by adding your first domain to manage DNS and SSL certificates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDomains.map((domain) => (
                <motion.div 
                  key={domain.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-black/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 rounded-3xl p-6 transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${domain.ssl ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                        {domain.ssl ? <Lock className="w-6 h-6 text-emerald-400" /> : <Unlock className="w-6 h-6 text-rose-400" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {domain.name}
                          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors cursor-pointer" />
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            DNS: {domain.dnsStatus}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Info className="w-3 h-3 text-cyan-500" />
                            IP: {domain.ip}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {!domain.ssl && (
                        <button 
                          onClick={() => handleIssueSSL(domain.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold font-mono transition-all"
                        >
                          ISSUE SSL
                        </button>
                      )}
                      {domain.ssl && (
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-mono text-slate-400">Expires: {domain.sslExpiry}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-xl text-slate-600 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 overflow-hidden relative">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl" />
            
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              AI Infrastructure Insights
            </h3>

            {isAiAnalyzing ? (
              <div className="space-y-4 py-8">
                <div className="flex justify-center">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-fuchsia-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <p className="text-center text-slate-400 font-mono text-xs animate-pulse">Analyzing network topology and SSL chains...</p>
              </div>
            ) : aiReport ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert prose-xs font-mono text-slate-400 leading-relaxed"
              >
                <div className="whitespace-pre-wrap">{aiReport}</div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <BrainCircuit className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 text-xs font-mono">Run AI Audit to get security and DNS recommendations.</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 border border-white/5 rounded-3xl p-6">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              DNS Instructions
            </h4>
            <p className="text-xs text-slate-400 font-mono leading-relaxed mb-4">
              To point your domain to this server, create an <span className="text-cyan-400">A Record</span> at your registrar:
            </p>
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-white">A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Host:</span>
                <span className="text-white">@</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Value:</span>
                <span className="text-cyan-400">1.2.3.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Domain Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <Plus className="w-6 h-6 text-cyan-500" />
                Add New Domain
              </h2>
              <form onSubmit={handleAddDomain} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Domain Name</label>
                  <input 
                    type="text" 
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-mono text-xs font-bold transition-all"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-mono text-xs font-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    ADD DOMAIN
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
