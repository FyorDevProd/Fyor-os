'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Server, Zap, Database, ShieldCheck, FileText, Settings, Layers, Menu, X, PlayCircle, Shield, CheckCircle2, Activity, Cpu, Globe, Terminal, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { motion } from 'motion/react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const { loginAsDemo } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isDemoMode) {
      loginAsDemo();
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('curl -sSO https://fyor.os/install.sh && bash install.sh');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    { title: 'Multi-WebServer', description: 'Nginx, Apache, and OpenLiteSpeed support out of the box.', icon: Server },
    { title: '1-Click WordPress', description: 'Deploy, backup, and clone WordPress sites instantly.', icon: Layers },
    { title: 'Project Management', description: 'Organize domains, databases, and SSL certificates.', icon: Settings },
    { title: 'Live Telemetry', description: 'Real-time CPU, RAM, and Network monitoring.', icon: Activity },
    { title: 'File Explorer', description: 'Full-featured web-based file manager with editor.', icon: FileText },
    { title: 'App Store', description: 'Install Redis, MySQL, Docker, and more with one click.', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] transition-all duration-500">
              <Server className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">FYOR OS</span>
          </motion.div>
          
          {/* Desktop Menu */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-10"
          >
            <div className="flex items-center gap-8 text-sm font-mono tracking-widest uppercase">
              <Link href="#features" className="text-slate-400 hover:text-cyan-400 transition-colors">Features</Link>
              <Link href="#pricing" className="text-slate-400 hover:text-fuchsia-400 transition-colors">Pricing</Link>
              <Link href="#docs" className="text-slate-400 hover:text-cyan-400 transition-colors">Docs</Link>
            </div>
            
            <div className="flex items-center gap-6 pl-8 border-l border-white/10">
              {/* Mode Toggle Pill */}
              <button 
                onClick={() => setIsDemoMode(!isDemoMode)}
                className="relative flex items-center p-1 rounded-full bg-white/5 border border-white/10 overflow-hidden group"
              >
                <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest transition-all duration-300 ${isDemoMode ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-slate-500'}`}>
                  DEMO
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest transition-all duration-300 ${!isDemoMode ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-slate-500'}`}>
                  REAL
                </div>
              </button>

              <button onClick={handleGetStarted} className="px-6 py-2.5 bg-white text-black text-sm font-black tracking-widest uppercase rounded-xl hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300">
                Enter OS
              </button>
            </div>
          </motion.div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#050505] p-6 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4 text-sm font-medium">
              <Link href="#features" className="text-slate-600 dark:text-slate-400" onClick={() => setIsMenuOpen(false)}>Features</Link>
              <Link href="#pricing" className="text-slate-600 dark:text-slate-400" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
              <Link href="#docs" className="text-slate-600 dark:text-slate-400" onClick={() => setIsMenuOpen(false)}>Documentation</Link>
            </div>
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mode</span>
                <button 
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold ${isDemoMode ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}
                >
                  {isDemoMode ? 'DEMO MODE' : 'REAL MODE'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme</span>
                <ThemeToggle />
              </div>
              <button onClick={handleGetStarted} className="w-full py-3 mt-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                Login to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      <main>
        {/* Hero Section - Split Layout */}
        <section className="relative pt-32 pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 dark:opacity-40 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-transparent blur-3xl rounded-full" />
          </div>
          
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Zap className="w-3 h-3" /> v2.0 is now live
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Server management, <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">simplified.</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                FYOR OS is a free, open-source web hosting control panel. Deploy websites, manage databases, and monitor your VPS through a beautiful, intuitive interface.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button 
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 hover:scale-105"
                >
                  {isDemoMode ? <PlayCircle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  {isDemoMode ? 'Try Live Demo' : 'Install FYOR OS'}
                </button>
                <Link href="#docs" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105">
                  <Terminal className="w-5 h-5 text-slate-400" /> View Docs
                </Link>
              </div>
            </motion.div>

            {/* Mock Dashboard UI */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative perspective-1000"
            >
              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl blur-xl opacity-20 dark:opacity-30 animate-pulse" />
              <div className="relative rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden transform-gpu hover:rotate-y-[-5deg] hover:rotate-x-[5deg] transition-transform duration-500">
                {/* Window Controls */}
                <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f0f]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="mx-auto text-xs font-mono text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    fyor-node-01.local
                  </div>
                </div>
                {/* Mock Content */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="col-span-2 flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg"><Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                      <div>
                        <div className="text-sm font-semibold">example.com</div>
                        <div className="text-xs text-slate-500">Running • PHP 8.2</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 cursor-pointer"
                  >
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU Usage</div>
                    <div className="text-2xl font-bold">12.4%</div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '12%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-blue-500 rounded-full" 
                      />
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 cursor-pointer"
                  >
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Layers className="w-3 h-3" /> RAM Usage</div>
                    <div className="text-2xl font-bold">2.1 GB</div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-fuchsia-500 rounded-full" 
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="border-y border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100 dark:divide-white/5">
              {[
                { value: '3.6M+', label: 'Active Installs' },
                { value: '99.9%', label: 'Uptime Guarantee' },
                { value: '80+', label: 'Software Apps' },
                { value: '24/7', label: 'Community Support' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 px-6 relative">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Everything you need to run your server</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Replace complex terminal commands with a beautiful, intuitive web interface.</p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner">
                      <f.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6 bg-slate-50 dark:bg-[#080808] border-t border-slate-200 dark:border-white/5 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Simple, transparent pricing</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Start for free, upgrade when you need advanced enterprise features.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 shadow-lg transition-transform"
              >
                <h3 className="text-2xl font-bold mb-2">Open Source</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Perfect for personal projects and small servers.</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-extrabold">$0</span>
                  <span className="text-slate-500 font-medium">/forever</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Unlimited Websites', 'Basic Security (Firewall)', 'Community Forum Support', 'Standard App Store'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} className="w-full py-3.5 rounded-xl border-2 border-slate-200 dark:border-white/10 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  Install Free Version
                </button>
              </motion.div>

              {/* Pro Plan */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-slate-900 dark:bg-blue-950/20 border-2 border-blue-600 shadow-2xl shadow-blue-900/20 relative overflow-hidden transition-transform"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-6 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-md">Recommended</div>
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <p className="text-slate-400 mb-6 text-sm">For businesses requiring advanced security and support.</p>
                <div className="flex items-baseline gap-1 mb-8 text-white">
                  <span className="text-5xl font-extrabold">$15</span>
                  <span className="text-slate-400 font-medium">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Everything in Open Source', 'Advanced WAF Security', 'Priority Ticket Support', 'Pro Plugins Included', 'Website Analytics & Logs'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-lg shadow-blue-500/25">
                  Upgrade to Pro
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="docs" className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-fuchsia-700 dark:from-blue-900 dark:to-fuchsia-900" />
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/pattern/1920/1080?blur=4')] opacity-20 mix-blend-overlay" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center relative z-10 text-white"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Ready to take control?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Install FYOR OS on your server in less than 2 minutes with our simple installation script.</p>
            <div className="inline-flex items-center gap-4 p-2 pr-4 bg-black/40 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
              <div className="px-4 py-2 bg-white/10 rounded-full font-mono text-sm overflow-x-auto max-w-[250px] sm:max-w-none whitespace-nowrap">
                curl -sSO https://fyor.os/install.sh && bash install.sh
              </div>
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-white/20 rounded-full transition-colors relative" 
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <FileText className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-600 flex items-center justify-center">
              <Server className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">FYOR OS</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} FYOR OS. Open Source Server Management.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

