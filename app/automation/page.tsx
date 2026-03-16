'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Plus, Play, Pause, Trash2, Settings2, Activity, Server, Globe, Sparkles, BrainCircuit, Loader2, Wand2, RefreshCw } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { toast } from 'sonner';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

const iconMap: any = { Activity, Server, Zap, Globe };

export default function AutomationPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAiArchitect, setShowAiArchitect] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/automation');
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
      toast.error('Failed to load automation rules');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRuleStatus = async (id: any, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/automation/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setRules(rules.map(r => r.id === id ? { ...r, status: newStatus } : r));
        toast.success(`Rule ${newStatus === 'active' ? 'enabled' : 'paused'}`);
      }
    } catch (err) {
      toast.error('Failed to update rule status');
    }
  };

  const deleteRule = async (id: any) => {
    try {
      const res = await fetch(`/api/automation/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRules(rules.filter(r => r.id !== id));
        toast.success('Rule deleted');
      }
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  const generateRule = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a server automation rule based on this request: "${aiPrompt}". 
        Return a JSON object with: name, condition, action (bash command), and icon (one of: Activity, Server, Zap, Globe).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              condition: { type: Type.STRING },
              action: { type: Type.STRING },
              icon: { type: Type.STRING }
            },
            required: ['name', 'condition', 'action', 'icon']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      
      const data = await res.json();
      if (data.success) {
        setRules([data.rule, ...rules]);
        setAiPrompt('');
        setShowAiArchitect(false);
        toast.success('AI Architect: Rule Generated', { description: `New rule "${result.name}" added to engine.` });
      }
    } catch (err) {
      console.error('AI Generation failed:', err);
      toast.error('AI Architect Error', { description: 'Failed to generate automation rule.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Automation</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Autonomous rule engine</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchRules}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl font-mono text-sm tracking-widest transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={() => setShowAiArchitect(!showAiArchitect)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 rounded-xl font-mono text-sm tracking-widest transition-all"
          >
            <BrainCircuit className="w-4 h-4" /> AI Architect
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/50 rounded-xl font-mono text-sm tracking-widest transition-all">
            <Plus className="w-4 h-4" /> New Rule
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAiArchitect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-900/20 to-fuchsia-900/20 border border-cyan-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest">AI Automation Architect</h3>
              </div>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the automation rule (e.g., 'Restart nginx if memory is over 80%')..."
                  className="flex-1 bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                />
                <button 
                  onClick={generateRule}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-mono text-xs font-black tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  GENERATE
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-3 uppercase tracking-tighter">
                Pro Tip: Use natural language. AI will handle the bash commands and logic.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto mb-4" />
            <p className="text-slate-400 font-mono uppercase tracking-widest">Loading Automation Engine...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-black/20 border border-dashed border-white/10 rounded-2xl">
            <Zap className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 font-mono uppercase tracking-widest">No rules active. Use AI Architect to build some.</p>
          </div>
        ) : rules.map((rule, i) => {
          const Icon = iconMap[rule.icon] || Zap;
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-black/40 backdrop-blur-md border rounded-2xl overflow-hidden group transition-all ${
                rule.status === 'active' ? 'border-cyan-500/30 hover:border-cyan-500/50' : 'border-slate-500/20 hover:border-slate-500/40 opacity-70'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border ${
                      rule.status === 'active' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{rule.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${rule.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span className={`text-xs font-mono uppercase ${rule.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {rule.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-slate-500 font-mono uppercase mb-1">Condition</p>
                    <p className="text-sm font-mono text-amber-400">{rule.condition}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-slate-500 font-mono uppercase mb-1">Action</p>
                    <p className="text-sm font-mono text-fuchsia-400 truncate" title={rule.action}>$ {rule.action}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleRuleStatus(rule.id, rule.status)}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border ${
                      rule.status === 'active' 
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {rule.status === 'active' ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Enable</>}
                  </button>
                  <button className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg transition-colors">
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
