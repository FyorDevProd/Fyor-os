'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Terminal, 
  Bot, 
  Server, 
  Globe, 
  Container, 
  FolderOpen, 
  ShieldAlert, 
  ScrollText, 
  Zap, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
  ListChecks,
  ShoppingBag,
  ShieldCheck,
  Cpu,
  Crosshair,
  Ghost,
  Mic,
  Stethoscope,
  Wand2
} from 'lucide-react';
import { useAuth } from './auth-provider';
import { useLanguage } from './language-provider';
import { LanguageSwitcher } from './language-switcher';

const navGroups = [
  {
    titleKey: 'group.core_ai',
    items: [
      { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
      { nameKey: 'nav.ai_utilities', href: '/ai-utilities', icon: Wand2, free: true },
      { nameKey: 'nav.ai_assistant', href: '/assistant', icon: Bot, pro: true },
      { nameKey: 'nav.jarvis_voice', href: '/jarvis', icon: Mic, pro: true },
      { nameKey: 'nav.war_room', href: '/war-room', icon: Crosshair, pro: true },
      { nameKey: 'nav.server_life', href: '/tamagotchi', icon: Ghost, pro: true },
      { nameKey: 'nav.autonomous', href: '/autonomous', icon: Cpu, pro: true },
      { nameKey: 'nav.log_doctor', href: '/ai-log-doctor', icon: Stethoscope, pro: true },
    ]
  },
  {
    titleKey: 'group.management',
    items: [
      { nameKey: 'nav.servers', href: '/servers', icon: Server },
      { nameKey: 'nav.websites', href: '/websites', icon: Globe },
      { nameKey: 'nav.databases', href: '/databases', icon: Database },
      { nameKey: 'nav.docker', href: '/docker', icon: Container },
      { nameKey: 'nav.marketplace', href: '/marketplace', icon: ShoppingBag },
    ]
  },
  {
    titleKey: 'group.system',
    items: [
      { nameKey: 'nav.terminal', href: '/terminal', icon: Terminal },
      { nameKey: 'nav.processes', href: '/processes', icon: Activity },
      { nameKey: 'nav.services', href: '/services', icon: ListChecks },
      { nameKey: 'nav.network', href: '/network', icon: Globe },
      { nameKey: 'nav.logs', href: '/logs', icon: ScrollText },
      { nameKey: 'nav.automation', href: '/automation', icon: Zap },
    ]
  },
  {
    titleKey: 'group.security',
    items: [
      { nameKey: 'nav.security_auditor', href: '/security-auditor', icon: ShieldCheck },
      { nameKey: 'nav.security', href: '/security', icon: ShieldAlert },
    ]
  },
  {
    titleKey: 'group.config',
    items: [
      { nameKey: 'nav.settings', href: '/settings', icon: Settings },
    ]
  }
];

export function Sidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  isOpen, 
  setIsOpen 
}: { 
  isCollapsed: boolean, 
  setIsCollapsed: (val: boolean) => void,
  isOpen: boolean,
  setIsOpen: (val: boolean) => void
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`h-screen bg-black/40 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 bg-black border border-cyan-500/50 rounded-full p-1 text-cyan-400 hover:bg-cyan-500/20 z-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`p-6 flex items-center ${isCollapsed ? 'lg:justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            {(!isCollapsed || isOpen) && (
              <div>
                <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                  FYOR OS
                </h1>
                <p className="text-[10px] text-cyan-500/50 font-mono uppercase tracking-widest">AI Control</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar pb-8">
          {navGroups.map((group) => (
            <div key={group.titleKey} className="space-y-2">
              {(!isCollapsed || isOpen) && (
                <h3 className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                  {t(group.titleKey)}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.nameKey}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      title={isCollapsed ? t(item.nameKey) : undefined}
                      className={`flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isCollapsed && !isOpen ? 'lg:justify-center px-0' : 'px-3'
                      } ${
                        isActive 
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                          : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      {(!isCollapsed || isOpen) && (
                        <>
                          <span className="truncate">{t(item.nameKey)}</span>
                          {(item as any).pro && (
                            <span className="ml-auto text-[8px] font-black bg-gradient-to-r from-amber-400 to-rose-500 text-black px-1.5 py-0.5 rounded-full tracking-tighter">PRO</span>
                          )}
                          {(item as any).free && (
                            <span className="ml-auto text-[8px] font-black bg-gradient-to-r from-emerald-400 to-cyan-500 text-black px-1.5 py-0.5 rounded-full tracking-tighter">FREE</span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-cyan-500/20 space-y-4">
          {(!isCollapsed || isOpen) && <LanguageSwitcher />}
          <button
            onClick={logout}
            title={isCollapsed ? t('nav.disconnect') : undefined}
            className={`flex items-center gap-3 py-2.5 w-full rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
              isCollapsed && !isOpen ? 'lg:justify-center px-0' : 'px-3'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(!isCollapsed || isOpen) && <span>{t('nav.disconnect')}</span>}
          </button>
        </div>
      </div>
    </>
  );
}
