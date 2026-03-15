'use client';

import { useLanguage } from './language-provider';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-colors">
      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value as any)}
        className="bg-transparent text-xs font-mono text-slate-300 focus:outline-none cursor-pointer w-full appearance-none"
      >
        <option value="en" className="bg-black text-white">EN - English</option>
        <option value="id" className="bg-black text-white">ID - Indonesia</option>
        <option value="zh" className="bg-black text-white">ZH - 中文</option>
      </select>
    </div>
  );
}
