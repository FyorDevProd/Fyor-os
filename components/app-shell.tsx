'use client';

import { AuthProvider, useAuth } from './auth-provider';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

function ShellContent({ children }: { children: React.ReactNode }) {
  const { user, loading, login, loginAsDemo } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-mono tracking-widest animate-pulse">INITIALIZING FYOR OS...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/cyberpunk/1920/1080?blur=10')] opacity-10 mix-blend-overlay" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 bg-black/60 backdrop-blur-xl p-8 lg:p-12 rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] max-w-md w-full text-center"
        >
          <ShieldAlert className="w-12 h-12 lg:w-16 lg:h-16 text-cyan-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2">
            FYOR OS
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 font-mono mb-8 uppercase tracking-widest">Autonomous Server Control</p>
          
          <div className="space-y-4">
            <button
              onClick={login}
              className="w-full py-4 px-6 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-xl text-cyan-300 font-mono font-bold tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
            >
              AUTHENTICATE
            </button>
            <button
              onClick={loginAsDemo}
              className="w-full py-4 px-6 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/50 rounded-xl text-fuchsia-300 font-mono font-bold tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:scale-[1.02]"
            >
              DEMO MODE
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 flex overflow-hidden font-sans selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black pointer-events-none" />
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className={`flex-1 flex flex-col relative z-10 h-screen overflow-hidden transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShellContent>{children}</ShellContent>
    </AuthProvider>
  );
}
