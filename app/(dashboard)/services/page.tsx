'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ListChecks, 
  Play, 
  Square, 
  RotateCcw, 
  Search, 
  RefreshCw, 
  Activity, 
  Shield, 
  Cpu, 
  Database,
  Globe,
  Settings2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  BrainCircuit,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

interface Service {
  name: string;
  running: boolean;
  startmode: string;
  pids: number[];
  cpu: number;
  mem: number;
}

export default function ServicesPage() {
  const { isDemo } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const predictHealth = async () => {
    if (services.length === 0) return;
    setIsPredicting(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these service stats and predict potential health issues or resource bottlenecks: ${JSON.stringify(services)}. Provide a concise prediction.`,
      });
      setAiPrediction(response.text || 'No prediction available.');
      toast.success('AI Predictor: Analysis Complete');
    } catch (err) {
      console.error('AI Prediction failed:', err);
      toast.error('AI Predictor Error', { description: 'Failed to predict service health.' });
    } finally {
      setIsPredicting(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch services');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchServices();
    };
    init();
    const interval = setInterval(fetchServices, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (name: string, action: 'start' | 'stop' | 'restart') => {
    if (isDemo) {
      toast.success(`Simulation: ${action} ${name}`, {
        description: `Service ${name} ${action}ed in virtual environment.`
      });
      return;
    }

    setActionLoading(`${name}-${action}`);
    
    toast.promise(
      fetch('/api/manage-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, action })
      }).then(res => res.json()),
      {
        loading: `${action.charAt(0).toUpperCase() + action.slice(1)}ing ${name}...`,
        success: (data) => {
          fetchServices();
          return data.message;
        },
        error: 'Action failed',
        finally: () => setActionLoading(null)
      }
    );
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-500 flex items-center gap-3">
            <ListChecks className="w-8 h-8 text-cyan-400" />
            Service Manager
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Control systemd units and background services.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={predictHealth}
            disabled={isPredicting || services.length === 0}
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-xl text-cyan-400 font-mono text-xs font-bold hover:bg-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isPredicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            AI PREDICTOR
          </button>
          <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Uptime: 14d 2h 15m</span>
          </div>
          <button 
            onClick={() => { setIsLoading(true); fetchServices(); }}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-400 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aiPrediction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-900/20 to-emerald-900/20 border border-cyan-500/30 rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4">
                <button onClick={() => setAiPrediction(null)} className="text-slate-500 hover:text-white transition-colors">×</button>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-2">AI Service Health Prediction</h3>
                  <div className="text-sm text-slate-200 font-mono leading-relaxed italic">
                    &quot;{aiPrediction}&quot;
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Total Services</span>
            <ListChecks className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-2xl font-black text-white font-mono">{services.length}</h3>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Running</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-emerald-400 font-mono">
            {services.filter(s => s.running).length}
          </h3>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Stopped</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-rose-400 font-mono">
            {services.filter(s => !s.running).length}
          </h3>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Auto-Start</span>
            <Settings2 className="w-4 h-4 text-cyan-500" />
          </div>
          <h3 className="text-2xl font-black text-cyan-400 font-mono">
            {services.filter(s => s.startmode === 'auto').length}
          </h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Filter services by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredServices.map((service) => (
            <motion.div
              key={service.name}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl group hover:border-cyan-500/30 transition-all"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${service.running ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                      {service.name === 'nginx' || service.name === 'apache2' ? <Globe className={`w-5 h-5 ${service.running ? 'text-emerald-400' : 'text-slate-500'}`} /> :
                       service.name === 'mysql' || service.name === 'postgresql' ? <Database className={`w-5 h-5 ${service.running ? 'text-emerald-400' : 'text-slate-500'}`} /> :
                       service.name === 'ufw' ? <Shield className={`w-5 h-5 ${service.running ? 'text-emerald-400' : 'text-slate-500'}`} /> :
                       <Activity className={`w-5 h-5 ${service.running ? 'text-emerald-400' : 'text-slate-500'}`} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest">{service.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${service.running ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className={`text-[10px] font-mono uppercase ${service.running ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {service.running ? 'Active (Running)' : 'Inactive (Dead)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Mode</span>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">{service.startmode}</span>
                  </div>
                </div>

                {service.running && (
                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">CPU</span>
                      <span className="text-xs font-mono text-slate-300">{service.cpu.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Memory</span>
                      <span className="text-xs font-mono text-slate-300">{service.mem.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {!service.running ? (
                    <button
                      onClick={() => handleAction(service.name, 'start')}
                      disabled={actionLoading === `${service.name}-start`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-mono font-bold transition-all disabled:opacity-50"
                    >
                      {actionLoading === `${service.name}-start` ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      START
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(service.name, 'stop')}
                      disabled={actionLoading === `${service.name}-stop`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-mono font-bold transition-all disabled:opacity-50"
                    >
                      {actionLoading === `${service.name}-stop` ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
                      STOP
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(service.name, 'restart')}
                    disabled={actionLoading === `${service.name}-restart`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-[10px] font-mono font-bold transition-all disabled:opacity-50"
                  >
                    {actionLoading === `${service.name}-restart` ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                    RESTART
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-500 font-mono text-sm">No services found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
