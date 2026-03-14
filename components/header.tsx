'use client';

import { useAuth } from './auth-provider';
import { Shield, User, Menu } from 'lucide-react';
import Image from 'next/image';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, role, isDemo } = useAuth();

  return (
    <header className="h-16 border-b border-cyan-500/20 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest hidden sm:inline">System Online</span>
          {isDemo && (
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded text-[10px] font-mono text-amber-400 uppercase tracking-widest animate-pulse">
              Demo
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {role && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase">{role}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-slate-200">{user?.displayName || 'Unknown User'}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
          </div>
          {user?.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt="Avatar" 
              width={32} 
              height={32} 
              className="w-8 h-8 rounded-full border border-cyan-500/30" 
              referrerPolicy="no-referrer" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-cyan-500/30">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
