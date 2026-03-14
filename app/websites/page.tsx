'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Plus, Github, Shield, Play, RotateCw, Trash2, ExternalLink } from 'lucide-react';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([
    { id: '1', domain: 'fyor.dev', status: 'active', ssl: true, repo: 'fyor/landing', framework: 'Next.js' },
    { id: '2', domain: 'api.fyor.dev', status: 'deploying', ssl: false, repo: 'fyor/api', framework: 'Node.js' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Websites</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Manage domains and deployments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/50 rounded-xl font-mono text-sm tracking-widest transition-all">
          <Plus className="w-4 h-4" /> New Site
        </button>
      </div>

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
                <button className="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <RotateCw className="w-3 h-3" /> Redeploy
                </button>
                <button className="flex-1 py-2 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-lg text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" /> {site.ssl ? 'Renew SSL' : 'Install SSL'}
                </button>
                <button className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
