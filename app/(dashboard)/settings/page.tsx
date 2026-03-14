'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Settings, Key, Github, Shield, Save, User, Database } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, role, isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  const handleDemoAction = (action: string) => {
    if (isDemo) {
      toast.error('Access Denied', {
        description: `Action "${action}" is disabled in Demo Mode.`
      });
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">System configuration and integrations</p>
        </div>
        <button 
          onClick={() => handleDemoAction('Save Settings')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-xl font-mono text-sm tracking-widest transition-all"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {[
            { id: 'general', name: 'General', icon: Settings },
            { id: 'account', name: 'Account', icon: User },
            { id: 'security', name: 'Security', icon: Shield },
            { id: 'api', name: 'API Keys', icon: Key },
            { id: 'github', name: 'GitHub', icon: Github },
            { id: 'database', name: 'Database', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8">
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold text-white font-mono uppercase tracking-widest border-b border-cyan-500/20 pb-4">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Panel Name</label>
                  <input type="text" defaultValue="FYOR AI SERVER OS" className="w-full max-w-md bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Timezone</label>
                  <select className="w-full max-w-md bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono">
                    <option>UTC</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <input type="checkbox" id="auto-update" defaultChecked className="w-4 h-4 rounded border-cyan-500/30 bg-black/50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-black" />
                  <label htmlFor="auto-update" className="text-sm text-slate-300">Enable automatic panel updates</label>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold text-white font-mono uppercase tracking-widest border-b border-cyan-500/20 pb-4">Account Information</h3>
              
              <div className="flex items-center gap-6 mb-8">
                {user?.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt="Avatar" 
                    width={80} 
                    height={80} 
                    className="w-20 h-20 rounded-2xl border-2 border-cyan-500/50" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center border-2 border-cyan-500/50">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-white">{user?.displayName || 'Admin User'}</h4>
                  <p className="text-slate-400 font-mono text-sm">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-mono text-cyan-400 uppercase">{role}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'github' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold text-white font-mono uppercase tracking-widest border-b border-cyan-500/20 pb-4 flex items-center gap-3">
                <Github className="w-6 h-6" /> GitHub Integration
              </h3>
              
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">Connect GitHub Account</h4>
                  <p className="text-sm text-slate-400 mt-1">Required for automated deployments and git pull features.</p>
                </div>
                <button 
                  onClick={() => handleDemoAction('Connect GitHub')}
                  className="px-6 py-2 bg-[#24292e] hover:bg-[#2f363d] text-white rounded-xl font-mono text-sm tracking-widest transition-all flex items-center gap-2 border border-slate-700"
                >
                  <Github className="w-4 h-4" /> Connect
                </button>
              </div>
            </motion.div>
          )}

          {/* Add other tabs as needed */}
          {['security', 'api', 'database'].includes(activeTab) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold text-white font-mono uppercase tracking-widest border-b border-cyan-500/20 pb-4 capitalize">{activeTab} Settings</h3>
              <p className="text-slate-400">Configuration options for {activeTab} will appear here.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
