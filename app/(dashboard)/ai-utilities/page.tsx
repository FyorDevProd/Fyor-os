'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, 
  TerminalSquare, 
  Clock, 
  Code2, 
  Sparkles, 
  Copy, 
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export default function AIUtilitiesPage() {
  const [activeTab, setActiveTab] = useState<'explainer' | 'cron' | 'regex'>('explainer');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setResult('');
    setCopied(false);

    try {
      let prompt = '';
      if (activeTab === 'explainer') {
        prompt = `You are a Linux expert. Explain this bash command in simple terms, breaking down each flag and argument: "${input}". Keep it concise and format it cleanly with bullet points.`;
      } else if (activeTab === 'cron') {
        prompt = `You are a cron expert. Convert this natural language schedule into a standard cron expression: "${input}". ONLY output the cron expression and a brief 1-sentence explanation. Format: \nExpression: * * * * *\nExplanation: Runs every minute.`;
      } else if (activeTab === 'regex') {
        prompt = `You are a regex expert. Create a regular expression for this requirement: "${input}". ONLY output the regex pattern and a brief 1-sentence explanation. Format: \nRegex: ^[a-z]+$\nExplanation: Matches lowercase letters.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setResult(response.text || 'No result generated.');
    } catch (err) {
      console.error('AI Generation failed:', err);
      toast.error('Generation Failed', { description: 'Could not connect to AI services.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'explainer', label: 'Command Explainer', icon: TerminalSquare, placeholder: 'e.g., tar -czvf archive.tar.gz /var/log' },
    { id: 'cron', label: 'Cron Generator', icon: Clock, placeholder: 'e.g., Every weekday at 3 AM' },
    { id: 'regex', label: 'Regex Builder', icon: Code2, placeholder: 'e.g., Match a valid IPv4 address' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-8 lg:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Wand2 className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest border border-emerald-500/30 rounded-full">
                100% Free AI
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4">
              AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">UTILITIES</span>
            </h1>
            <p className="text-slate-400 font-mono text-sm max-w-xl leading-relaxed">
              Powerful AI micro-tools available for all users. Generate cronjobs, build complex regex patterns, and demystify cryptic bash commands instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tool Area */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-white/10 bg-white/5 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setInput('');
                setResult('');
              }}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-b-2 border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Your Request
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tabs.find(t => t.id === activeTab)?.placeholder}
              className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="w-full py-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-xl font-mono text-sm font-black tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              GENERATE MAGIC
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                AI Output
              </label>
              {result && (
                <button 
                  onClick={copyToClipboard}
                  className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              )}
            </div>
            <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-4 relative overflow-hidden min-h-[160px]">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-emerald-500/50"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs font-mono uppercase tracking-widest animate-pulse">Consulting AI...</span>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed h-full overflow-y-auto custom-scrollbar"
                  >
                    {result}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs font-mono uppercase tracking-widest"
                  >
                    Waiting for input...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
