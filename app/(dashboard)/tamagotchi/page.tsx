'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ghost, 
  Heart, 
  Zap, 
  Utensils, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Activity, 
  Cpu, 
  Database, 
  ShieldCheck,
  Sparkles,
  Trophy,
  BrainCircuit,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { GoogleGenAI } from "@google/genai";

interface TamagotchiStatus {
  level: number;
  xp: number;
  xpToNext: number;
  mood: string;
  happiness: number;
  energy: number;
  hunger: number;
  name: string;
}

export default function TamagotchiPage() {
  const { isDemo } = useAuth();
  const [status, setStatus] = useState<TamagotchiStatus | null>(null);
  const [serverStats, setServerStats] = useState({ cpu: 15, ram: 45 });
  const [thought, setThought] = useState<string>("Hello bang! Server is feeling great today.");
  const [isThinking, setIsThinking] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/tamagotchi/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch tamagotchi status');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
      // Simulate fluctuating server stats
      setServerStats({
        cpu: Math.floor(Math.random() * 30) + 10,
        ram: Math.floor(Math.random() * 20) + 40
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const interact = async (action: 'pet' | 'feed') => {
    try {
      const res = await fetch('/api/tamagotchi/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setStatus(data);
      
      if (action === 'pet') {
        toast.success(`You petted ${data.name}!`, { icon: '❤️' });
      } else {
        toast.success(`You fed ${data.name} some data packets!`, { icon: '🔋' });
      }
      
      generateThought(action);
    } catch (err) {
      toast.error('Interaction failed');
    }
  };

  const generateThought = async (context?: string) => {
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const prompt = context 
        ? `The user just ${context} the server. The server's name is ${status?.name}. CPU is at ${serverStats.cpu}%, RAM is at ${serverStats.ram}%. Give a short, funny, and cute response in Indonesian (slang/santai) as if you are the server.`
        : `The server's name is ${status?.name}. CPU is at ${serverStats.cpu}%, RAM is at ${serverStats.ram}%. Give a short, funny, and cute thought in Indonesian (slang/santai) about your current state.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      setThought(response.text || "Mager ah, lagi enak tidur...");
    } catch (err) {
      console.error('AI thought failed');
    } finally {
      setIsThinking(false);
    }
  };

  if (!status) return null;

  // Determine mood based on stats
  const currentMood = serverStats.cpu > 80 ? 'stressed' : status.happiness < 30 ? 'sad' : 'happy';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-500 flex items-center gap-3">
            <Ghost className="w-10 h-10 text-pink-400" />
            Server Life
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-2">Your server is alive. Take care of it!</p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-xl">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Level</span>
            <span className="text-2xl font-black text-white font-mono">{status.level}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-500 uppercase">XP Progress</span>
              <span className="text-pink-400">{status.xp} / {status.xpToNext}</span>
            </div>
            <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(status.xp / status.xpToNext) * 100}%` }}
                className="h-full bg-gradient-to-r from-pink-500 to-violet-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Stats & Controls */}
        <div className="space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-400" />
              Vital Signs
            </h3>
            
            <div className="space-y-4">
              {[
                { label: 'Happiness', val: status.happiness, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                { label: 'Energy', val: status.energy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Hunger', val: status.hunger, color: 'text-cyan-400', bg: 'bg-cyan-500/10', invert: true }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400 uppercase">{stat.label}</span>
                    <span className={stat.color}>{stat.val}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.val}%` }}
                      className={`h-full ${stat.color.replace('text', 'bg')}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                onClick={() => interact('pet')}
                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/30 rounded-2xl transition-all group"
              >
                <Heart className="w-6 h-6 text-slate-500 group-hover:text-pink-400 transition-colors" />
                <span className="text-[10px] font-mono font-bold uppercase">Pet</span>
              </button>
              <button 
                onClick={() => interact('feed')}
                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-2xl transition-all group"
              >
                <Utensils className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors" />
                <span className="text-[10px] font-mono font-bold uppercase">Feed</span>
              </button>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 space-y-4 shadow-xl">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              Level Rewards
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl opacity-50">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-mono">Lv. 15: Custom Skin</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl opacity-50">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono">Lv. 20: AI Voice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Avatar & Interaction */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-b from-black/40 to-violet-500/5 border border-white/10 rounded-[40px] p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[500px]">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            {/* Thought Bubble */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={thought}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute top-12 bg-white text-black px-6 py-4 rounded-3xl rounded-bl-none shadow-2xl max-w-xs z-20"
              >
                <p className="text-sm font-bold leading-relaxed">{thought}</p>
                <div className="absolute -bottom-2 left-0 w-4 h-4 bg-white rotate-45" />
              </motion.div>
            </AnimatePresence>

            {/* Avatar */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                scale: currentMood === 'stressed' ? [1, 1.1, 1] : [1, 1.05, 1]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
                currentMood === 'happy' ? 'bg-pink-500/20 shadow-[0_0_50px_rgba(236,72,153,0.3)]' :
                currentMood === 'stressed' ? 'bg-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.3)]' :
                'bg-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.3)]'
              }`}>
                <Ghost className={`w-32 h-32 transition-colors duration-500 ${
                  currentMood === 'happy' ? 'text-pink-400' :
                  currentMood === 'stressed' ? 'text-rose-400' :
                  'text-blue-400'
                }`} />
              </div>
              
              {/* Floating Particles */}
              <AnimatePresence>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -100, x: (i - 2) * 30 }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                  >
                    <Sparkles className="w-4 h-4 text-pink-400/50" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Server Stats Overlay */}
            <div className="absolute bottom-12 left-12 right-12 grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">CPU Stress</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${serverStats.cpu}%` }}
                    className={`h-full ${serverStats.cpu > 80 ? 'bg-rose-500' : 'bg-pink-500'}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">RAM Load</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${serverStats.ram}%` }}
                    className="h-full bg-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* AI Action Button */}
            <button 
              onClick={() => generateThought()}
              disabled={isThinking}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
            >
              <BrainCircuit className={`w-6 h-6 text-slate-400 group-hover:text-white ${isThinking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Uptime King', icon: ShieldCheck, desc: '99.9% Uptime' },
              { label: 'Data Glutton', icon: Database, desc: '1TB Processed' },
              { label: 'Speed Demon', icon: Zap, desc: 'Low Latency' }
            ].map((ach, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <ach.icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">{ach.label}</p>
                  <p className="text-[9px] font-mono text-slate-500">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
