'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Terminal, Bot, Database } from 'lucide-react';

function InteractiveDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const runDemo = async () => {
      while (isMounted) {
        setStep(0);
        await new Promise(r => setTimeout(r, 1500));
        if(!isMounted) break;
        setStep(1);
        await new Promise(r => setTimeout(r, 2000));
        if(!isMounted) break;
        setStep(2);
        await new Promise(r => setTimeout(r, 1500));
        if(!isMounted) break;
        setStep(3);
        await new Promise(r => setTimeout(r, 3500));
        if(!isMounted) break;
        setStep(4);
        await new Promise(r => setTimeout(r, 5000));
      }
    };
    runDemo();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="relative rounded-2xl border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-black/80 backdrop-blur-xl aspect-video flex flex-col font-mono text-sm" id="demo">
      {/* Mac-like Header */}
      <div className="h-10 border-b border-cyan-500/30 flex items-center px-4 gap-2 bg-white/5">
        <div className="w-3 h-3 rounded-full bg-rose-500/80" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <div className="mx-auto text-slate-500 text-xs flex items-center gap-2">
          <Bot className="w-3 h-3" /> FYOR OS - Autonomous Mode
        </div>
      </div>
      
      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar mini */}
        <div className="w-16 border-r border-cyan-500/30 flex flex-col items-center py-4 gap-4 bg-black/50 hidden sm:flex">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center"><Bot className="w-4 h-4" /></div>
          <div className="w-8 h-8 rounded-lg text-slate-600 flex items-center justify-center"><Terminal className="w-4 h-4" /></div>
          <div className="w-8 h-8 rounded-lg text-slate-600 flex items-center justify-center"><Database className="w-4 h-4" /></div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 gap-4 relative">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
              className="self-end bg-white/10 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-2 text-slate-300 max-w-[90%] sm:max-w-[80%]"
            >
              Deploy a new Node.js app from my github repo and set up SSL.
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
              className="self-start bg-cyan-500/10 border border-cyan-500/30 rounded-2xl rounded-tl-sm px-4 py-2 text-cyan-300 max-w-[90%] sm:max-w-[80%] flex items-center gap-3"
            >
              <Bot className="w-4 h-4 shrink-0" />
              {step === 2 ? (
                <span className="flex items-center gap-2">Analyzing request <span className="flex gap-1"><span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" /><span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-75" /><span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-150" /></span></span>
              ) : (
                "Executing deployment sequence..."
              )}
            </motion.div>

            {step >= 4 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="self-start bg-emerald-500/10 border border-emerald-500/30 rounded-2xl rounded-tl-sm px-4 py-2 text-emerald-300 max-w-[90%] sm:max-w-[80%] flex items-center gap-3 mt-auto"
              >
                <Bot className="w-4 h-4 shrink-0" />
                Deployment successful! App is running securely at https://myapp.fyor.os
              </motion.div>
            )}
          </div>

          {/* Terminal Area */}
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: step >= 3 ? 1 : 0, height: step >= 3 ? '140px' : 0 }}
            className="bg-black/80 border border-slate-800 rounded-xl p-4 overflow-hidden relative"
          >
            <div className="absolute top-2 right-3 text-[10px] text-slate-600">TERMINAL</div>
            <div className="text-emerald-500 text-xs sm:text-sm space-y-1">
              {step >= 3 && <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}>$ git clone https://github.com/user/myapp.git</motion.div>}
              {step >= 3 && <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}>$ cd myapp && npm install</motion.div>}
              {step >= 3 && <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}} className="text-slate-400">added 142 packages, and audited 143 packages in 2s</motion.div>}
              {step >= 3 && <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.0}}>$ pm2 start npm --name &quot;myapp&quot; -- start</motion.div>}
              {step >= 3 && <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.5}}>$ certbot --nginx -d myapp.fyor.os</motion.div>}
              {step >= 3 && <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.8}} className="text-cyan-400">Successfully deployed certificate for myapp.fyor.os</motion.div>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            FYOR AI Core 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">
            Server Management, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Reimagined</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-12 font-light leading-relaxed">
            Manage your VPS using natural language. Monitor performance, deploy websites, and configure firewalls without touching the terminal. Welcome to the future of DevOps.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-cyan-500 text-black rounded-xl font-mono font-bold tracking-widest hover:bg-cyan-400 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2"
            >
              GET STARTED <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-mono font-bold tracking-widest hover:bg-white/10 transition-all text-slate-300 flex items-center justify-center gap-2"
            >
              <Terminal className="w-5 h-5" /> VIEW DEMO
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <InteractiveDemo />
        </motion.div>
      </div>
    </section>
  );
}
