'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
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
  Wand2,
  Clock,
  HardDrive,
  ChevronDown
} from 'lucide-react';
import { useAuth } from './auth-provider';
import { useLanguage } from './language-provider';
import { LanguageSwitcher } from './language-switcher';

const navGroups = [
  {
    titleKey: 'group.core_ai',
    icon: Bot,
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
    icon: Server,
    items: [
      { nameKey: 'nav.servers', href: '/servers', icon: Server },
      { nameKey: 'nav.websites', href: '/websites', icon: Globe },
      { nameKey: 'nav.domains', href: '/domains', icon: Globe },
      { nameKey: 'nav.databases', href: '/databases', icon: Database },
      { nameKey: 'nav.ftp', href: '/ftp', icon: HardDrive },
      { nameKey: 'nav.files', href: '/files', icon: FolderOpen },
      { nameKey: 'nav.docker', href: '/docker', icon: Container },
      { nameKey: 'nav.marketplace', href: '/marketplace', icon: ShoppingBag },
      { nameKey: 'nav.backups', href: '/backups', icon: HardDrive },
    ]
  },
  {
    titleKey: 'group.system',
    icon: Terminal,
    items: [
      { nameKey: 'nav.terminal', href: '/terminal', icon: Terminal },
      { nameKey: 'nav.cron', href: '/cron', icon: Clock },
      { nameKey: 'nav.processes', href: '/processes', icon: Activity },
      { nameKey: 'nav.services', href: '/services', icon: ListChecks },
      { nameKey: 'nav.network', href: '/network', icon: Globe },
      { nameKey: 'nav.logs', href: '/logs', icon: ScrollText },
      { nameKey: 'nav.automation', href: '/automation', icon: Zap },
    ]
  },
  {
    titleKey: 'group.security',
    icon: ShieldCheck,
    items: [
      { nameKey: 'nav.security_auditor', href: '/security-auditor', icon: ShieldCheck },
      { nameKey: 'nav.security', href: '/security', icon: ShieldAlert },
      { nameKey: 'nav.firewall', href: '/firewall', icon: ShieldCheck },
    ]
  },
  {
    titleKey: 'group.config',
    icon: Settings,
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
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Auto-expand the group that contains the current active path
  useEffect(() => {
    const activeGroup = navGroups.find(group => 
      group.items.some(item => item.href === pathname)
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.titleKey)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedGroups(prev => [...prev, activeGroup.titleKey]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (titleKey: string) => {
    if (isCollapsed && !isOpen) {
      setIsCollapsed(false);
      setExpandedGroups([titleKey]);
      return;
    }
    
    setExpandedGroups(prev => 
      prev.includes(titleKey) 
        ? prev.filter(k => k !== titleKey)
        : [...prev, titleKey]
    );
  };

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
        
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar pb-8">
          {navGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.titleKey);
            const hasActiveItem = group.items.some(item => item.href === pathname);
            
            return (
              <div key={group.titleKey} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.titleKey)}
                  title={isCollapsed && !isOpen ? t(group.titleKey) : undefined}
                  className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isCollapsed && !isOpen ? 'lg:justify-center px-0' : 'px-3'
                  } ${
                    hasActiveItem && !isExpanded
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <group.icon className={`w-5 h-5 shrink-0 ${hasActiveItem && !isExpanded ? 'text-cyan-400' : 'text-slate-400'}`} />
                  
                  {(!isCollapsed || isOpen) && (
                    <>
                      <span className="flex-1 text-left truncate tracking-wide">{t(group.titleKey)}</span>
                      <ChevronDown 
                        className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </>
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (!isCollapsed || isOpen) && (
                    <motion.initial
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1 pb-2 space-y-1">
                        {group.items.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.nameKey}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 pl-11 pr-3 ${
                                isActive 
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                                  : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                              <span className="truncate">{t(item.nameKey)}</span>
                              {(item as any).pro && (
                                <span className="ml-auto text-[8px] font-black bg-gradient-to-r from-amber-400 to-rose-500 text-black px-1.5 py-0.5 rounded-full tracking-tighter">PRO</span>
                              )}
                              {(item as any).free && (
                                <span className="ml-auto text-[8px] font-black bg-gradient-to-r from-emerald-400 to-cyan-500 text-black px-1.5 py-0.5 rounded-full tracking-tighter">FREE</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.initial>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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
