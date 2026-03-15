'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.ai_utilities': 'AI Utilities',
    'nav.ai_assistant': 'AI Assistant',
    'nav.jarvis_voice': 'Jarvis Voice',
    'nav.war_room': 'War Room',
    'nav.server_life': 'Server Life',
    'nav.autonomous': 'Autonomous Core',
    'nav.log_doctor': 'AI Log Doctor',
    'nav.servers': 'Servers',
    'nav.websites': 'Websites',
    'nav.databases': 'Databases',
    'nav.docker': 'Docker',
    'nav.marketplace': 'Marketplace',
    'nav.terminal': 'Terminal',
    'nav.processes': 'Processes',
    'nav.services': 'Services',
    'nav.network': 'Network',
    'nav.logs': 'Logs',
    'nav.automation': 'Automation',
    'nav.security_auditor': 'Security Auditor',
    'nav.security': 'Security',
    'nav.settings': 'Settings',
    'nav.disconnect': 'Disconnect',
    'group.core_ai': 'Core AI',
    'group.management': 'Management',
    'group.system': 'System',
    'group.security': 'Security',
    'group.config': 'Config',
  },
  id: {
    'nav.dashboard': 'Dasbor',
    'nav.ai_utilities': 'Alat AI',
    'nav.ai_assistant': 'Asisten AI',
    'nav.jarvis_voice': 'Suara Jarvis',
    'nav.war_room': 'Ruang Perang',
    'nav.server_life': 'Kehidupan Server',
    'nav.autonomous': 'Inti Otonom',
    'nav.log_doctor': 'Dokter Log AI',
    'nav.servers': 'Server',
    'nav.websites': 'Situs Web',
    'nav.databases': 'Basis Data',
    'nav.docker': 'Docker',
    'nav.marketplace': 'Pasar Aplikasi',
    'nav.terminal': 'Terminal',
    'nav.processes': 'Proses',
    'nav.services': 'Layanan',
    'nav.network': 'Jaringan',
    'nav.logs': 'Catatan (Log)',
    'nav.automation': 'Otomatisasi',
    'nav.security_auditor': 'Auditor Keamanan',
    'nav.security': 'Keamanan',
    'nav.settings': 'Pengaturan',
    'nav.disconnect': 'Putuskan',
    'group.core_ai': 'Inti AI',
    'group.management': 'Manajemen',
    'group.system': 'Sistem',
    'group.security': 'Keamanan',
    'group.config': 'Konfigurasi',
  },
  zh: {
    'nav.dashboard': '仪表板',
    'nav.ai_utilities': 'AI 工具',
    'nav.ai_assistant': 'AI 助手',
    'nav.jarvis_voice': '贾维斯语音',
    'nav.war_room': '作战室',
    'nav.server_life': '服务器生活',
    'nav.autonomous': '自主核心',
    'nav.log_doctor': 'AI 日志医生',
    'nav.servers': '服务器',
    'nav.websites': '网站',
    'nav.databases': '数据库',
    'nav.docker': 'Docker',
    'nav.marketplace': '应用市场',
    'nav.terminal': '终端',
    'nav.processes': '进程',
    'nav.services': '服务',
    'nav.network': '网络',
    'nav.logs': '日志',
    'nav.automation': '自动化',
    'nav.security_auditor': '安全审计员',
    'nav.security': '安全',
    'nav.settings': '设置',
    'nav.disconnect': '断开连接',
    'group.core_ai': '核心 AI',
    'group.management': '管理',
    'group.system': '系统',
    'group.security': '安全',
    'group.config': '配置',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fyor_lang') as Language;
    if (saved && ['en', 'id', 'zh'].includes(saved)) {
      setTimeout(() => {
        setLanguage(saved);
        document.documentElement.lang = saved;
      }, 0);
    }
    setTimeout(() => setMounted(true), 0);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('fyor_lang', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string) => {
    if (!mounted) return translations['en'][key] || key;
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
