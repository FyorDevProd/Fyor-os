'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Eye, 
  Zap, 
  Terminal,
  Fingerprint,
  Activity,
  Globe,
  MoreVertical,
  Ban,
  Scan,
  BrainCircuit
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { GoogleGenAI, Type } from "@google/genai";

interface SecurityEvent {
  id: string;
  type: 'brute-force' | 'unauthorized-access' | 'firewall-block' | 'suspicious-activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  source: string;
  description: string;
  status: 'pending' | 'resolved' | 'ignored';
  recommendation: string;
}

export default function SecurityAuditorPage() {
  const { isDemo } = useAuth();
  const [isAuditing, setIsAuditing] = useState(false);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAudit = async () => {
    setIsAuditing(true);
    setIsAnalyzing(true);
    setAiInsight(null);

    try {
      const res = await fetch('/api/security/audit', { method: 'POST' });
      const { logs } = await res.json();

      // Use Gemini to analyze logs
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these system logs and identify security threats. Return a JSON array of security events with these fields: id, type, severity, timestamp, source, description, status (always 'pending'), recommendation.
        
        Logs:
        ${logs.join('\n')}
        
        Also provide a general summary of the security posture.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              events: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                    source: { type: Type.STRING },
                    description: { type: Type.STRING },
                    status: { type: Type.STRING },
                    recommendation: { type: Type.STRING }
                  }
                }
              },
              summary: { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setEvents(result.events || []);
      setAiInsight(result.summary || "No critical threats detected at this time.");
      
      toast.success('Security Audit Complete', {
        description: `Found ${result.events?.length || 0} potential security events.`
      });
    } catch (err) {
      console.error('Audit failed:', err);
      toast.error('Audit Failed', {
        description: 'Could not complete security analysis.'
      });
    } finally {
      setIsAuditing(false);
      setIsAnalyzing(false);
    }
  };

  const blockIp = async (ip: string) => {
    if (isDemo) {
      toast.success(`Simulation: IP ${ip} blocked`, {
        description: 'Firewall rule added to virtual stack.'
      });
      setEvents(prev => prev.map(e => e.source === ip ? { ...e, status: 'resolved' } : e));
      return;
    }

    toast.promise(
      fetch('/api/security/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      }).then(res => res.json()),
      {
        loading: `Blocking IP ${ip}...`,
        success: (data) => {
          setEvents(prev => prev.map(e => e.source === ip ? { ...e, status: 'resolved' } : e));
          return data.message;
        },
        error: 'Failed to block IP'
      }
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500 flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-rose-500" />
            Security Auditor
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-2">AI-powered threat detection and security analysis.</p>
        </div>
        <button 
          onClick={runAudit}
          disabled={isAuditing}
          className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-mono text-sm font-black transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] flex items-center gap-3 disabled:opacity-50"
        >
          {isAuditing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
          RUN SECURITY SCAN
        </button>
      </div>

      {/* AI Insight Panel */}
      <AnimatePresence>
        {aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-md border border-rose-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-32 h-32 text-rose-500" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-xl">
                  <BrainCircuit className="w-6 h-6 text-rose-400" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">AI Security Insight</h2>
              </div>
              <p className="text-slate-300 font-mono text-sm leading-relaxed max-w-4xl">
                {aiInsight}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Events List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white tracking-tighter flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              Detected Threats
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Last Scan: {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {events.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center bg-black/40 border border-white/10 rounded-3xl border-dashed"
                >
                  <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-mono text-sm">No active threats detected. Run a scan to analyze logs.</p>
                </motion.div>
              ) : (
                events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-black/40 backdrop-blur-md border rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start transition-all ${
                      event.severity === 'critical' ? 'border-rose-500/30' : 
                      event.severity === 'high' ? 'border-orange-500/30' : 
                      'border-white/10'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl shrink-0 ${
                      event.severity === 'critical' ? 'bg-rose-500/10' : 
                      event.severity === 'high' ? 'bg-orange-500/10' : 
                      'bg-slate-500/10'
                    }`}>
                      <AlertTriangle className={`w-8 h-8 ${
                        event.severity === 'critical' ? 'text-rose-500' : 
                        event.severity === 'high' ? 'text-orange-500' : 
                        'text-slate-500'
                      }`} />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest ${
                          event.severity === 'critical' ? 'bg-rose-500 text-white' : 
                          event.severity === 'high' ? 'bg-orange-500 text-white' : 
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {event.severity}
                        </span>
                        <h4 className="text-lg font-black text-white tracking-tighter">{event.type.replace('-', ' ').toUpperCase()}</h4>
                        <span className="text-[10px] font-mono text-slate-500">{event.timestamp}</span>
                      </div>
                      
                      <p className="text-sm text-slate-400 font-mono leading-relaxed">
                        {event.description}
                      </p>

                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <BrainCircuit className="w-3 h-3 text-cyan-400" />
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">AI Recommendation</span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono italic">
                          &quot;{event.recommendation}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                      {event.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => blockIp(event.source)}
                            className="px-6 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Ban className="w-3 h-3" />
                            BLOCK SOURCE
                          </button>
                          <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 rounded-xl text-[10px] font-mono font-bold transition-all">
                            IGNORE
                          </button>
                        </>
                      ) : (
                        <div className="px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          RESOLVED
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          {/* Security Score */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 text-center space-y-6">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest">System Security Score</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-white/5 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                <motion.circle 
                  className="text-rose-500 stroke-current" 
                  strokeWidth="8" 
                  strokeDasharray="251.2" 
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * (1 - 0.85) }}
                  strokeLinecap="round" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white font-mono">85</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Secure</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Your system is currently <span className="text-emerald-400 font-bold">STABLE</span>. 
              Last breach attempt was blocked 15 minutes ago.
            </p>
          </div>

          {/* Firewall Status */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Firewall Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">UFW Service</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Blocked IPs</span>
                <span className="text-xs font-mono text-white font-bold">1,242</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Rules Active</span>
                <span className="text-xs font-mono text-white font-bold">18</span>
              </div>
            </div>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-mono text-[10px] font-bold transition-all">
              MANAGE FIREWALL RULES
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              Live Security Feed
            </h3>
            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {[
                { time: '14:20', msg: 'SSH Login Success: root from 192.168.1.5' },
                { time: '14:15', msg: 'UFW Block: 45.142.195.22 on Port 22' },
                { time: '14:10', msg: 'UFW Block: 45.142.195.22 on Port 22' },
                { time: '14:05', msg: 'Failed SSH Login: root from 185.220.101.12' },
                { time: '14:00', msg: 'System Update: Security patches applied' }
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px] font-mono">
                  <span className="text-slate-600 shrink-0">{log.time}</span>
                  <span className="text-slate-400 truncate">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
