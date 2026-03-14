'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Search, 
  Rocket, 
  Globe, 
  Database, 
  Shield, 
  Zap, 
  Star, 
  Download, 
  ExternalLink,
  Info,
  CheckCircle2,
  Loader2,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';

interface App {
  id: string;
  name: string;
  description: string;
  category: 'Web' | 'Database' | 'Tool' | 'CMS';
  icon: any;
  image: string;
  stars: number;
  downloads: string;
  version: string;
}

const apps: App[] = [
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'The world\'s most popular website builder and CMS.',
    category: 'CMS',
    icon: Globe,
    image: 'https://picsum.photos/seed/wordpress/400/200',
    stars: 4.8,
    downloads: '10M+',
    version: '6.4.3'
  },
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Professional publishing platform for modern creators.',
    category: 'CMS',
    icon: Zap,
    image: 'https://picsum.photos/seed/ghost/400/200',
    stars: 4.7,
    downloads: '500K+',
    version: '5.80.0'
  },
  {
    id: 'nextcloud',
    name: 'Nextcloud',
    description: 'The self-hosted productivity platform that keeps you in control.',
    category: 'Tool',
    icon: Shield,
    image: 'https://picsum.photos/seed/nextcloud/400/200',
    stars: 4.9,
    downloads: '2M+',
    version: '28.0.2'
  },
  {
    id: 'meilisearch',
    name: 'Meilisearch',
    description: 'Lightning-fast, ultra-relevant search engine for your apps.',
    category: 'Tool',
    icon: Search,
    image: 'https://picsum.photos/seed/meili/400/200',
    stars: 4.8,
    downloads: '1M+',
    version: '1.6.2'
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'The most popular document-based NoSQL database.',
    category: 'Database',
    icon: Database,
    image: 'https://picsum.photos/seed/mongo/400/200',
    stars: 4.7,
    downloads: '5M+',
    version: '7.0.5'
  },
  {
    id: 'redis',
    name: 'Redis',
    description: 'In-memory data structure store, used as a database and cache.',
    category: 'Database',
    icon: Zap,
    image: 'https://picsum.photos/seed/redis/400/200',
    stars: 4.9,
    downloads: '8M+',
    version: '7.2.4'
  },
  {
    id: 'strapi',
    name: 'Strapi',
    description: 'The leading open-source headless CMS. 100% JavaScript.',
    category: 'CMS',
    icon: LayoutGrid,
    image: 'https://picsum.photos/seed/strapi/400/200',
    stars: 4.6,
    downloads: '800K+',
    version: '4.20.1'
  },
  {
    id: 'uptime-kuma',
    name: 'Uptime Kuma',
    description: 'A self-hosted monitoring tool like "Uptime Robot".',
    category: 'Tool',
    icon: Activity,
    image: 'https://picsum.photos/seed/kuma/400/200',
    stars: 4.9,
    downloads: '300K+',
    version: '1.23.11'
  }
];

import { Activity } from 'lucide-react';

export default function MarketplacePage() {
  const { isDemo } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const categories = ['All', 'Web', 'Database', 'Tool', 'CMS'];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeploy = async (app: App) => {
    if (isDemo) {
      toast.error('Access Denied', {
        description: 'App deployment is disabled in Demo Mode.'
      });
      return;
    }

    setDeployingId(app.id);
    
    toast.promise(
      fetch('/api/marketplace/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id, appName: app.name })
      }).then(res => res.json()),
      {
        loading: `Deploying ${app.name} to your server...`,
        success: (data) => {
          setDeployingId(null);
          return `${app.name} deployed! Container ID: ${data.containerId}`;
        },
        error: (err) => {
          setDeployingId(null);
          return 'Deployment failed. Please check logs.';
        }
      }
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-cyan-400" />
            App Marketplace
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-2">One-click instant deployment for your favorite applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-white font-bold tracking-widest uppercase">Featured Apps</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search apps by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all shadow-xl"
          />
        </div>
        <div className="flex gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar w-full lg:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredApps.map((app, i) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-xl hover:border-cyan-500/30 transition-all"
            >
              {/* Image Preview */}
              <div className="relative h-40 overflow-hidden">
                <Image 
                  src={app.image} 
                  alt={app.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {app.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-mono text-white font-bold">{app.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-mono text-slate-400">{app.downloads}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                      <app.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white tracking-tighter">{app.name}</h3>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">v{app.version}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-mono leading-relaxed line-clamp-2">
                  {app.description}
                </p>

                <div className="pt-4 mt-auto flex gap-2">
                  <button 
                    onClick={() => handleDeploy(app)}
                    disabled={deployingId === app.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-mono text-xs font-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] disabled:opacity-50"
                  >
                    {deployingId === app.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        DEPLOYING...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        ONE-CLICK DEPLOY
                      </>
                    )}
                  </button>
                  <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 rounded-2xl transition-all">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && (
        <div className="py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
            <Search className="w-10 h-10 text-slate-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white tracking-tighter">No apps found</h3>
            <p className="text-slate-500 font-mono text-sm">Try adjusting your search or category filters.</p>
          </div>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="px-6 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-mono text-xs font-bold transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-lg font-black text-white tracking-tighter">Secure & Isolated</h4>
            <p className="text-xs text-slate-400 font-mono mt-1">All marketplace apps are deployed as isolated Docker containers with pre-configured security rules.</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-white text-black rounded-2xl font-mono text-xs font-black hover:bg-slate-200 transition-all whitespace-nowrap">
          REQUEST AN APP
        </button>
      </div>
    </div>
  );
}
