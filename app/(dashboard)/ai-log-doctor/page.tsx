'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ShieldAlert, 
  RefreshCw,
  Terminal as TerminalIcon,
  ChevronRight,
  Activity,
  Wand2,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  source: string;
}

interface Diagnosis {
  problem: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  solution: string;
  actionCmd?: string;
}

export default function AILogDoctor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [history, setHistory] = useState<Diagnosis[]>([]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system-logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const analyzeLog = async (log: LogEntry) => {
    setAnalyzing(true);
    setSelectedLog(log);
    setDiagnosis(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this system log and provide a diagnosis in JSON format: "${log.message}". 
        The response should include: problem, severity (low, medium, high, critical), explanation, solution, and an optional actionCmd (a shell command to fix it).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              problem: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
              explanation: { type: Type.STRING },
              solution: { type: Type.STRING },
              actionCmd: { type: Type.STRING }
            },
            required: ['problem', 'severity', 'explanation', 'solution']
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setDiagnosis(result);
        setHistory(prev => [result, ...prev].slice(0, 10));
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const applyFix = () => {
    if (!diagnosis?.actionCmd) return;
    toast.success('Simulation: Applying Fix', {
      description: `Executing: ${diagnosis.actionCmd}`
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-8 lg:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Stethoscope className="w-8 h-8 text-cyan-400" />
              </div>
              <span className="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-mono uppercase tracking-widest border border-fuchsia-500/30 rounded-full">
                Pro Feature
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">
              AI LOG <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">DOCTOR</span>
            </h1>
            <p className="text-slate-400 font-mono text-sm max-w-xl leading-relaxed">
              Advanced neural analysis for your system logs. Detect anomalies, diagnose bottlenecks, and get automated fix suggestions in seconds.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchLogs}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-mono text-slate-300 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Logs
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live System Logs
              </h3>
              <span className="text-[10px] font-mono text-slate-500">{logs.length} entries found</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500 font-mono text-sm">Scanning system journals...</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <button
                      key={log.id}
                      onClick={() => analyzeLog(log)}
                      className={`w-full text-left p-4 hover:bg-white/5 transition-colors group flex items-start gap-4 ${selectedLog?.id === log.id ? 'bg-cyan-500/5 border-l-2 border-cyan-500' : ''}`}
                    >
                      <div className="text-[10px] font-mono text-slate-600 mt-1 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-slate-300 break-all line-clamp-2 group-hover:line-clamp-none transition-all">
                          {log.message}
                        </p>
                      </div>
                      <Search className="w-4 h-4 text-slate-700 group-hover:text-cyan-500 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Diagnosis Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8 text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <Stethoscope className="absolute inset-0 m-auto w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono uppercase tracking-widest">AI Analyzing</h3>
                <p className="text-slate-500 text-xs font-mono leading-relaxed">
                  Cross-referencing log patterns with known system vulnerabilities and optimization heuristics...
                </p>
              </motion.div>
            ) : diagnosis ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden"
              >
                <div className={`p-4 flex items-center gap-3 ${
                  diagnosis.severity === 'critical' ? 'bg-rose-500/20 border-b border-rose-500/30' :
                  diagnosis.severity === 'high' ? 'bg-amber-500/20 border-b border-amber-500/30' :
                  'bg-cyan-500/20 border-b border-cyan-500/30'
                }`}>
                  {diagnosis.severity === 'critical' || diagnosis.severity === 'high' ? (
                    <ShieldAlert className={`w-5 h-5 ${diagnosis.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`} />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  )}
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Diagnosis Results</h3>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Detected Issue</label>
                    <p className="text-lg font-bold text-white leading-tight">{diagnosis.problem}</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Severity Level</label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${
                      diagnosis.severity === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      diagnosis.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      diagnosis.severity === 'medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {diagnosis.severity}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">AI Explanation</label>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed">{diagnosis.explanation}</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
                      <Wand2 className="w-3 h-3" />
                      Recommended Solution
                    </label>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed mb-4">{diagnosis.solution}</p>
                    {diagnosis.actionCmd && (
                      <button 
                        onClick={applyFix}
                        className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-[10px] font-mono text-cyan-400 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Zap className="w-3 h-3" />
                        Apply Auto-Fix
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8 text-center">
                <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-widest">No Diagnosis</h3>
                <p className="text-slate-600 text-xs font-mono mt-2">
                  Select a log entry from the list to start AI analysis.
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* Analysis History */}
          <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Recent History</h3>
            </div>
            <div className="p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-[10px] text-slate-600 font-mono italic">No recent analyses</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 truncate max-w-[150px]">{h.problem}</span>
                    <span className={`uppercase ${
                      h.severity === 'critical' ? 'text-rose-500' :
                      h.severity === 'high' ? 'text-amber-500' : 'text-cyan-500'
                    }`}>{h.severity}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
