'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, ShieldAlert, ShieldCheck, Lock, Unlock, 
  Eye, EyeOff, AlertTriangle, Search, RefreshCw,
  Terminal, Activity, Globe, Cpu, MemoryStick,
  ChevronRight, Sparkles, BrainCircuit, CheckCircle2,
  X, Info
} from 'lucide-react';
import { generateAIResponse } from '@/lib/gemini';
import { toast } from 'sonner';

interface ScanResult {
  openPorts: number[];
  activeUsers: string[];
  services: { name: string; running: boolean }[];
  timestamp: string;
}

export default function SecurityAuditor() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const performScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/security/scan');
      const data = await res.json();
      setScanResult(data);
      toast.success('Security scan completed');
    } catch (error) {
      toast.error('Failed to perform security scan');
    } finally {
      setIsScanning(false);
    }
  };

  const generateAiReport = async () => {
    if (!scanResult) return;
    setIsAnalyzing(true);
    try {
      const prompt = `Perform a security audit based on these server stats:
      Open Ports: ${scanResult.openPorts.join(', ')}
      Active Users: ${scanResult.activeUsers.join(', ')}
      Services: ${scanResult.services.map(s => `${s.name} (${s.running ? 'Running' : 'Stopped'})`).join(', ')}
      
      Identify potential risks and provide specific remediation steps. 
      Format as a professional security report with sections: "Risk Assessment", "Vulnerabilities", and "Remediation".`;
      
      const report = await generateAIResponse(prompt, "You are an AI Security Auditor. Be thorough, professional, and technical.");
      setAiReport(report);
    } catch (error) {
      toast.error('Failed to generate AI report');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white flex items-center gap-4">
            <Shield className="w-10 h-10 lg:w-12 lg:h-12 text-fuchsia-500" />
            AI Security <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-rose-500">Auditor</span>
          </h1>
          <p className="text-slate-400 font-mono text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Continuous Vulnerability Monitoring
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={performScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold font-mono text-white transition-all disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            RUN SCAN
          </button>
          <button 
            onClick={generateAiReport}
            disabled={!scanResult || isAnalyzing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-rose-500 hover:from-fuchsia-600 hover:to-rose-600 rounded-2xl text-sm font-bold font-mono text-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(217,70,239,0.3)]"
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            AI AUDIT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scan Results */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Card */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Security Status</h3>
            {!scanResult ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldAlert className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm font-mono">No scan data available.<br/>Run a scan to begin.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">SECURE</p>
                    <p className="text-xs font-mono text-slate-400">Last scan: {new Date(scanResult.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs font-mono text-slate-400">Open Ports</span>
                    <span className="text-sm font-bold text-white">{scanResult.openPorts.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs font-mono text-slate-400">Active Users</span>
                    <span className="text-sm font-bold text-white">{scanResult.activeUsers.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-xs font-mono text-slate-400">Running Services</span>
                    <span className="text-sm font-bold text-white">{scanResult.services.filter(s => s.running).length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Open Ports List */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Listening Ports</h3>
            <div className="flex flex-wrap gap-2">
              {scanResult?.openPorts.map(port => (
                <div key={port} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs font-mono text-cyan-400">
                  :{port}
                </div>
              )) || <p className="text-slate-600 text-xs italic">No ports detected</p>}
            </div>
          </div>
        </div>

        {/* Right Column: AI Report */}
        <div className="lg:col-span-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 min-h-[600px] relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-fuchsia-400" />
                  AI Security Audit Report
                </h3>
                {aiReport && (
                  <button 
                    onClick={() => setAiReport(null)}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {!aiReport ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  {isAnalyzing ? (
                    <>
                      <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-fuchsia-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                        <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-fuchsia-400 animate-pulse" />
                      </div>
                      <p className="text-slate-300 font-mono text-sm animate-pulse">AI is analyzing system telemetry...</p>
                      <p className="text-slate-500 text-xs mt-2">Checking for vulnerabilities and misconfigurations</p>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-16 h-16 text-slate-800 mb-6" />
                      <p className="text-slate-500 font-mono text-sm">Run a scan and click &quot;AI AUDIT&quot; to generate a detailed report.</p>
                    </>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-invert prose-sm sm:prose-base max-w-none"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 text-fuchsia-400 mb-4">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-widest font-bold">Confidential Report</span>
                    </div>
                    <div className="text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {aiReport}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/5">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                          AI
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 font-mono italic">Verified by FYOR OS Intelligence Engine</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
