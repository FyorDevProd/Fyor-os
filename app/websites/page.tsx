'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Plus, Github, Shield, Play, RotateCw, Trash2, ExternalLink, Loader2, Settings, X, Server, Lock, Activity, FileText, Link as LinkIcon, AlertTriangle, Image as ImageIcon, Code, Database, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface Website {
  id: string;
  domain: string;
  status: string;
  ssl: boolean;
  repo: string;
  framework: string;
  phpVersion?: string;
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSite, setNewSite] = useState({ domain: '', repo: '', framework: 'Static', phpVersion: '8.2' });
  const [siteToDelete, setSiteToDelete] = useState<Website | null>(null);
  const [installingSSL, setInstallingSSL] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<Website | null>(null);
  const [activeTab, setActiveTab] = useState('domain');

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const res = await fetch('/api/websites');
      const data = await res.json();
      setWebsites(data);
    } catch (err) {
      toast.error('Failed to load websites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.domain) return toast.error('Domain is required');
    
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Website created successfully');
        setWebsites([...websites, data.website]);
        setIsCreating(false);
        setNewSite({ domain: '', repo: '', framework: 'Static', phpVersion: '8.2' });
      } else {
        toast.error(data.error || 'Failed to create website');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const confirmDelete = async () => {
    if (!siteToDelete) return;
    try {
      const res = await fetch(`/api/websites/${siteToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Website deleted successfully');
        setWebsites(websites.filter(w => w.id !== siteToDelete.id));
        if (selectedSite?.id === siteToDelete.id) setSelectedSite(null);
      } else {
        toast.error(data.error || 'Failed to delete website');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSiteToDelete(null);
    }
  };

  const handleInstallSSL = async (domain: string, id: string) => {
    setInstallingSSL(id);
    toast.info(`Starting SSL installation for ${domain}...`);

    try {
      const res = await fetch('/api/ssl/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setWebsites(prev => prev.map(w => w.id === id ? { ...w, ssl: true } : w));
      } else {
        toast.error(data.error || 'Failed to install SSL');
      }
    } catch (err) {
      toast.error('Network error during SSL installation');
    } finally {
      setInstallingSSL(null);
    }
  };

  const tabs = [
    { id: 'domain', label: 'Domain Management', icon: Globe },
    { id: 'subdir', label: 'Sub-directory binding', icon: Server },
    { id: 'directory', label: 'Site Directory', icon: FileText },
    { id: 'traffic', label: 'Traffic Limit', icon: Activity },
    { id: 'rewrite', label: 'URL Rewrite', icon: LinkIcon },
    { id: 'defaultdoc', label: 'Default Document', icon: FileText },
    { id: 'ssl', label: 'SSL', icon: Shield },
    { id: 'php', label: 'PHP Version', icon: Code },
    { id: 'tomcat', label: 'Tomcat', icon: Database },
    { id: 'proxy', label: 'Reverse proxy', icon: Server },
    { id: 'waf', label: 'Anti-XSS / WAF', icon: AlertTriangle },
    { id: 'hotlink', label: 'Hotlink Protection', icon: ImageIcon },
    { id: 'redirect', label: 'Redirect', icon: LinkIcon },
    { id: 'config', label: 'Config File', icon: Terminal },
    { id: 'logs', label: 'Logs', icon: FileText },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'domain':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" placeholder="Enter domain name (e.g., www.example.com)" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
              <button onClick={() => toast.info('Additional domain binding coming soon')} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-colors">Add</button>
            </div>
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-slate-400 text-xs uppercase font-mono">
                  <tr>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Port</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="px-4 py-3">{selectedSite?.domain}</td>
                    <td className="px-4 py-3">80, 443</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSiteToDelete(selectedSite)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'proxy':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-400">Configure reverse proxy rules to forward requests to backend servers.</p>
              <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-colors">Add Proxy</button>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Proxy Name</label>
                  <input type="text" placeholder="e.g., api-proxy" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Target URL</label>
                  <input type="text" placeholder="http://127.0.0.1:8080" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Send Domain</label>
                  <input type="text" placeholder="$host" defaultValue="$host" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase mb-1">Cache</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                    <option>Disable</option>
                    <option>Enable</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-colors">Save Rule</button>
              </div>
            </div>
          </div>
        );
      case 'rewrite':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                <option>0. Current</option>
                <option>1. WordPress</option>
                <option>2. Laravel</option>
                <option>3. ThinkPHP</option>
                <option>4. CodeIgniter</option>
              </select>
              <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-colors">Save</button>
            </div>
            <textarea 
              className="w-full h-64 bg-black/60 border border-white/10 rounded-lg p-4 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              defaultValue={`location / {\n  try_files $uri $uri/ /index.php?$args;\n}`}
            />
          </div>
        );
      case 'ssl':
        return (
          <div className="space-y-6">
            <div className="flex gap-4 border-b border-white/10 pb-4">
              <button className="text-sm font-bold text-cyan-400 border-b-2 border-cyan-400 pb-1">Let&apos;s Encrypt</button>
              <button className="text-sm font-bold text-slate-400 hover:text-white pb-1">Custom SSL</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white">Force HTTPS</h4>
                  <p className="text-xs text-slate-400 mt-1">Redirect all HTTP traffic to HTTPS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={selectedSite?.ssl} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-emerald-400">Certificate is Active</h4>
                </div>
                <p className="text-xs text-slate-300 font-mono">Issuer: Let&apos;s Encrypt Authority X3</p>
                <p className="text-xs text-slate-300 font-mono">Expires: 2026-06-15</p>
              </div>
              <button className="w-full py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-colors">Renew Certificate</button>
            </div>
          </div>
        );
      case 'php':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 mb-4">Select the PHP version for this website. Ensure the selected version is installed in the App Store.</p>
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-white">PHP Version:</label>
              <select 
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                defaultValue={selectedSite?.phpVersion || '8.2'}
              >
                <option value="00">Pure Static</option>
                <option value="74">PHP-74</option>
                <option value="80">PHP-80</option>
                <option value="81">PHP-81</option>
                <option value="82">PHP-82</option>
                <option value="83">PHP-83</option>
              </select>
              <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-colors">Switch</button>
            </div>
          </div>
        );
      case 'config':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Directly edit the Nginx/Apache configuration file for this site.</p>
              <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/30 transition-colors">Save</button>
            </div>
            <textarea 
              className="w-full h-96 bg-black/60 border border-white/10 rounded-lg p-4 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              defaultValue={`server {\n    listen 80;\n    listen 443 ssl http2;\n    server_name ${selectedSite?.domain};\n    index index.php index.html index.htm default.php default.htm default.html;\n    root /www/wwwroot/${selectedSite?.domain};\n    \n    #SSL-START SSL related configuration\n    #error_page 404/404.html;\n    #...`}
            />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Settings className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Feature under construction</h3>
            <p className="text-sm text-slate-400">The {tabs.find(t => t.id === activeTab)?.label} feature is currently being implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Websites</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Manage domains and deployments</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/50 rounded-xl font-mono text-sm tracking-widest transition-all"
        >
          <Plus className="w-4 h-4" /> Add Site
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : websites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
          <Globe className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No websites found</h3>
          <p className="text-sm text-slate-400 mb-6">Add your first website to get started.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-colors"
          >
            Add Website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {websites.map((site) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden group hover:border-cyan-500/40 transition-colors"
            >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl border ${
                    site.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {site.domain}
                      <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono text-slate-400 uppercase">{site.framework}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className={`text-xs font-mono uppercase flex items-center gap-1 ${
                        site.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {site.status === 'active' ? <Play className="w-3 h-3" /> : <RotateCw className="w-3 h-3 animate-spin" />}
                        {site.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${site.ssl ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <span className="text-xs font-mono text-slate-300 uppercase">SSL Cert</span>
                  </div>
                  <span className={`text-xs font-mono ${site.ssl ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {site.ssl ? 'Active' : 'Missing'}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-mono text-slate-300 uppercase">Source</span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 truncate max-w-[100px]" title={site.repo}>
                    {site.repo}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedSite(site)}
                  className="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-3 h-3" /> Settings
                </button>
                <button 
                  onClick={() => handleInstallSSL(site.domain, site.id)}
                  disabled={installingSSL === site.id}
                  className="flex-1 py-2 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-lg text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {installingSSL === site.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                  {installingSSL === site.id ? 'Installing...' : site.ssl ? 'Renew SSL' : 'Install SSL'}
                </button>
                <button 
                  onClick={() => setSiteToDelete(site)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {/* Create Site Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Add New Website</h2>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateSite} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Domain Name</label>
                  <input 
                    type="text" 
                    required
                    value={newSite.domain}
                    onChange={e => setNewSite({...newSite, domain: e.target.value})}
                    placeholder="e.g., example.com" 
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Framework</label>
                  <select 
                    value={newSite.framework}
                    onChange={e => setNewSite({...newSite, framework: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Static">Static HTML</option>
                    <option value="Next.js">Next.js</option>
                    <option value="Node.js">Node.js</option>
                    <option value="PHP">PHP</option>
                    <option value="WordPress">WordPress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">PHP Version (if applicable)</label>
                  <select 
                    value={newSite.phpVersion}
                    onChange={e => setNewSite({...newSite, phpVersion: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="8.2">PHP 8.2</option>
                    <option value="8.1">PHP 8.1</option>
                    <option value="8.0">PHP 8.0</option>
                    <option value="7.4">PHP 7.4</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                  >
                    Create Site
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {siteToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSiteToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
            >
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Delete Website?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete <strong className="text-white">{siteToDelete.domain}</strong>? This action cannot be undone and will remove all associated files and configurations.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSiteToDelete(null)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {selectedSite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSite(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-black/40 border-r border-white/10 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-lg font-bold text-white truncate">{selectedSite.domain}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-1">Site Settings</p>
                </div>
                <div className="p-2 space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {tabs.find(t => t.id === activeTab)?.icon && (() => {
                      const Icon = tabs.find(t => t.id === activeTab)!.icon;
                      return <Icon className="w-5 h-5 text-cyan-400" />;
                    })()}
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h3>
                  <button 
                    onClick={() => setSelectedSite(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
