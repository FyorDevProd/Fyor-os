'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Activity, 
  Globe, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RefreshCw,
  Search,
  Eye,
  Zap,
  Download
} from 'lucide-react';

const mockFirewallRules = [
  { id: 1, name: 'SSH', port: '22', protocol: 'TCP', action: 'ALLOW', source: 'Anywhere' },
  { id: 2, name: 'HTTP', port: '80', protocol: 'TCP', action: 'ALLOW', source: 'Anywhere' },
  { id: 3, name: 'HTTPS', port: '443', protocol: 'TCP', action: 'ALLOW', source: 'Anywhere' },
  { id: 4, name: 'Database', port: '5432', protocol: 'TCP', action: 'DENY', source: 'Anywhere' },
  { id: 5, name: 'Custom App', port: '3000', protocol: 'TCP', action: 'ALLOW', source: '192.168.1.0/24' },
];

const mockAuditLogs = [
  { id: 1, time: '2026-03-13 13:45:22', user: 'root', action: 'Login Success', ip: '192.168.1.10', status: 'success' },
  { id: 2, time: '2026-03-13 13:40:15', user: 'admin', action: 'Login Failed', ip: '45.12.33.102', status: 'failed' },
  { id: 3, time: '2026-03-13 12:30:05', user: 'root', action: 'Config Changed', ip: '192.168.1.10', status: 'info' },
  { id: 4, time: '2026-03-13 11:15:40', user: 'unknown', action: 'Brute Force Attempt', ip: '185.22.10.5', status: 'alert' },
];

export default function SecurityPage() {
  const { isDemo } = useAuth();
  const [securityScore, setSecurityScore] = useState(85);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'firewall' | 'audit' | 'hardening'>('firewall');

  const handleDemoAction = (action: string) => {
    if (isDemo) {
      toast.error('Access Denied', {
        description: `Action "${action}" is disabled in Demo Mode.`
      });
      return true;
    }
    return false;
  };

  const runSecurityScan = () => {
    setIsScanning(true);
    toast.info('Security Audit Started', {
      description: 'Scanning ports and analyzing system logs...'
    });

    setTimeout(() => {
      setIsScanning(false);
      setSecurityScore(92);
      toast.success('Security Audit Complete', {
        description: 'System hardening recommendations applied. Score improved to 92%.'
      });
    }, 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            Security & Firewall
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Protect your infrastructure with advanced hardening.</p>
        </div>
        <button 
          onClick={runSecurityScan}
          disabled={isScanning}
          className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 font-mono text-sm font-bold hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isScanning ? 'SCANNING...' : 'RUN SECURITY AUDIT'}
        </button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-md border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Security Score</p>
              <h3 className="text-4xl font-black text-white mt-1">{securityScore}%</h3>
            </div>
            <div className={`p-3 rounded-xl border ${securityScore > 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
              {securityScore > 90 ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${securityScore}%` }}
              className={`h-full ${securityScore > 90 ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-3 uppercase tracking-tighter">
            {securityScore > 90 ? 'System is highly secured' : 'Vulnerabilities detected - Action required'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-md border border-cyan-500/20 p-6 rounded-2xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Active Firewall</p>
              <h3 className="text-4xl font-black text-white mt-1">UFW</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Status: Active</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-3 uppercase tracking-tighter">
            Filtering 1,242 packets/sec
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-md border border-fuchsia-500/20 p-6 rounded-2xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Intrusion Detection</p>
              <h3 className="text-4xl font-black text-white mt-1">Fail2Ban</h3>
            </div>
            <div className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20 text-fuchsia-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-fuchsia-400 uppercase tracking-widest">12 IPs Banned Today</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-3 uppercase tracking-tighter">
            Last ban: 45.12.33.102 (5 mins ago)
          </p>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-1 bg-black/40 backdrop-blur-md border border-emerald-500/20 p-1 rounded-xl w-fit">
        {[
          { id: 'firewall', label: 'Firewall Rules', icon: Lock },
          { id: 'audit', label: 'Audit Logs', icon: Terminal },
          { id: 'hardening', label: 'Hardening', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-2xl overflow-hidden"
      >
        {activeTab === 'firewall' && (
          <>
            <div className="p-4 border-b border-emerald-500/20 flex justify-between items-center bg-white/5">
              <h2 className="font-mono text-emerald-400 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Lock className="w-4 h-4" /> Firewall Configuration
              </h2>
              <button 
                onClick={() => handleDemoAction('Add Rule')}
                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-mono text-xs hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Add Rule
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-500/20 bg-black/60">
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Service</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Port</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Protocol</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Source</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider">Action</th>
                    <th className="p-4 text-xs font-mono text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {mockFirewallRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-mono text-sm text-slate-200">{rule.name}</td>
                      <td className="p-4 text-sm text-slate-400 font-mono">{rule.port}</td>
                      <td className="p-4 text-sm text-slate-400 font-mono">{rule.protocol}</td>
                      <td className="p-4 text-sm text-slate-400 font-mono">{rule.source}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                          rule.action === 'ALLOW' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {rule.action}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleDemoAction('Delete Rule')} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'audit' && (
          <>
            <div className="p-4 border-b border-emerald-500/20 flex justify-between items-center bg-white/5">
              <h2 className="font-mono text-emerald-400 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Terminal className="w-4 h-4" /> Security Audit Logs
              </h2>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {mockAuditLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-black/40 border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all group">
                  <div className={`p-2 rounded-lg ${
                    log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.status === 'failed' ? 'bg-rose-500/10 text-rose-400' :
                    log.status === 'alert' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                     log.status === 'failed' ? <AlertTriangle className="w-4 h-4" /> :
                     log.status === 'alert' ? <ShieldAlert className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono text-slate-200">{log.action}</p>
                      <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">User: {log.user}</span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">IP: {log.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'hardening' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> System Hardening
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'SSH Root Login', status: 'Disabled', secure: true },
                  { label: 'Password Authentication', status: 'Disabled', secure: true },
                  { label: 'Automatic Updates', status: 'Enabled', secure: true },
                  { label: 'Kernel Hardening', status: 'Active', secure: true },
                  { label: 'ICMP Echo (Ping)', status: 'Enabled', secure: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="text-sm font-mono text-slate-200">{item.label}</p>
                      <p className={`text-[10px] font-mono mt-1 uppercase ${item.secure ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.status}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDemoAction('Toggle Setting')}
                      className={`w-12 h-6 rounded-full relative transition-colors ${item.secure ? 'bg-emerald-500/40' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.secure ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
              <ShieldCheck className="w-16 h-16 text-emerald-400 mb-4" />
              <h4 className="text-xl font-black text-white mb-2">Security Recommendation</h4>
              <p className="text-sm text-slate-400 font-mono leading-relaxed mb-6">
                Your system is currently well-protected. We recommend disabling ICMP Echo (Ping) to make your server less visible to automated network scanners.
              </p>
              <button 
                onClick={() => handleDemoAction('Apply Recommendation')}
                className="px-6 py-2 bg-emerald-500 text-black font-black font-mono text-xs uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all"
              >
                Apply Fix Now
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
