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
  Github,
  LayoutGrid,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { AdBanner } from '@/components/ad-banner';

interface App {
  id: string;
  name: string;
  description: string;
  category: 'Web' | 'Database' | 'Tool' | 'CMS' | 'Security' | 'AI' | 'Plugin' | 'AI & ML';
  icon: any;
  image: string;
  stars: number;
  downloads: string;
  version: string;
  price?: number;
  isPro?: boolean;
}

const apps: App[] = [
  // --- WEB SERVERS ---
  {
    id: 'nginx',
    name: 'Nginx',
    description: 'High performance web server and reverse proxy.',
    category: 'Web',
    icon: Globe,
    image: 'https://picsum.photos/seed/nginx/400/200',
    stars: 4.9,
    downloads: '20M+',
    version: '1.24.0'
  },
  {
    id: 'apache',
    name: 'Apache',
    description: 'The world\'s most used web server software.',
    category: 'Web',
    icon: Globe,
    image: 'https://picsum.photos/seed/apache/400/200',
    stars: 4.7,
    downloads: '15M+',
    version: '2.4.58'
  },
  {
    id: 'openlitespeed',
    name: 'OpenLiteSpeed',
    description: 'High-performance, lightweight, open source HTTP server.',
    category: 'Web',
    icon: Zap,
    image: 'https://picsum.photos/seed/ols/400/200',
    stars: 4.8,
    downloads: '5M+',
    version: '1.7.18'
  },
  {
    id: 'nginx-pro',
    name: 'Nginx Pro',
    description: 'Advanced Nginx with built-in WAF, load balancing, and caching optimization.',
    category: 'Web',
    icon: Shield,
    image: 'https://picsum.photos/seed/nginxpro/400/200',
    stars: 5.0,
    downloads: '500K+',
    version: '1.24.0-pro',
    price: 9.99,
    isPro: true
  },

  // --- DATABASES ---
  {
    id: 'mysql-8',
    name: 'MySQL 8.0',
    description: 'The world\'s most popular open-source relational database.',
    category: 'Database',
    icon: Database,
    image: 'https://picsum.photos/seed/mysql/400/200',
    stars: 4.8,
    downloads: '15M+',
    version: '8.0.36'
  },
  {
    id: 'mysql-57',
    name: 'MySQL 5.7',
    description: 'Legacy stable version of MySQL relational database.',
    category: 'Database',
    icon: Database,
    image: 'https://picsum.photos/seed/mysql57/400/200',
    stars: 4.7,
    downloads: '10M+',
    version: '5.7.44'
  },
  {
    id: 'mariadb',
    name: 'MariaDB',
    description: 'Enhanced, drop-in replacement for MySQL.',
    category: 'Database',
    icon: Database,
    image: 'https://picsum.photos/seed/mariadb/400/200',
    stars: 4.8,
    downloads: '8M+',
    version: '10.11.6'
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'The world\'s most advanced open source relational database.',
    category: 'Database',
    icon: Database,
    image: 'https://picsum.photos/seed/postgres/400/200',
    stars: 4.9,
    downloads: '12M+',
    version: '16.2'
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
    id: 'memcached',
    name: 'Memcached',
    description: 'Free & open source, high-performance, distributed memory object caching system.',
    category: 'Database',
    icon: Zap,
    image: 'https://picsum.photos/seed/memcached/400/200',
    stars: 4.6,
    downloads: '4M+',
    version: '1.6.22'
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

  // --- PHP VERSIONS ---
  {
    id: 'php-83',
    name: 'PHP 8.3',
    description: 'Latest stable PHP version with typed class constants and new random extension.',
    category: 'Tool',
    icon: LayoutGrid,
    image: 'https://picsum.photos/seed/php83/400/200',
    stars: 4.9,
    downloads: '2M+',
    version: '8.3.3'
  },
  {
    id: 'php-82',
    name: 'PHP 8.2',
    description: 'Stable PHP environment for modern web applications.',
    category: 'Tool',
    icon: LayoutGrid,
    image: 'https://picsum.photos/seed/php82/400/200',
    stars: 4.8,
    downloads: '5M+',
    version: '8.2.16'
  },
  {
    id: 'php-81',
    name: 'PHP 8.1',
    description: 'PHP environment with enums, readonly properties, and fibers.',
    category: 'Tool',
    icon: LayoutGrid,
    image: 'https://picsum.photos/seed/php81/400/200',
    stars: 4.7,
    downloads: '6M+',
    version: '8.1.27'
  },
  {
    id: 'php-74',
    name: 'PHP 7.4',
    description: 'Legacy PHP environment (End of Life - use only if necessary).',
    category: 'Tool',
    icon: LayoutGrid,
    image: 'https://picsum.photos/seed/php74/400/200',
    stars: 4.5,
    downloads: '10M+',
    version: '7.4.33'
  },

  // --- TOOLS & MANAGERS ---
  {
    id: 'phpmyadmin',
    name: 'phpMyAdmin',
    description: 'Free software tool written in PHP, intended to handle the administration of MySQL.',
    category: 'Tool',
    icon: Database,
    image: 'https://picsum.photos/seed/pma/400/200',
    stars: 4.8,
    downloads: '15M+',
    version: '5.2.1'
  },
  {
    id: 'docker-manager',
    name: 'Docker Manager',
    description: 'Manage Docker containers, images, networks, and volumes from the UI.',
    category: 'Tool',
    icon: Rocket,
    image: 'https://picsum.photos/seed/docker/400/200',
    stars: 4.9,
    downloads: '8M+',
    version: '2.0.1'
  },
  {
    id: 'pm2-manager',
    name: 'PM2 Manager',
    description: 'Advanced process manager for Node.js applications.',
    category: 'Tool',
    icon: Activity,
    image: 'https://picsum.photos/seed/pm2/400/200',
    stars: 4.8,
    downloads: '4M+',
    version: '5.3.1'
  },
  {
    id: 'python-manager',
    name: 'Python Manager',
    description: 'Manage Python virtual environments and WSGI/ASGI applications.',
    category: 'Tool',
    icon: LayoutGrid,
    image: 'https://picsum.photos/seed/python/400/200',
    stars: 4.7,
    downloads: '2M+',
    version: '2.1.0'
  },
  {
    id: 'pure-ftpd',
    name: 'Pure-Ftpd',
    description: 'Free, secure, production-quality and standard-conformant FTP server.',
    category: 'Tool',
    icon: Download,
    image: 'https://picsum.photos/seed/ftp/400/200',
    stars: 4.6,
    downloads: '5M+',
    version: '1.0.51'
  },
  {
    id: 'bind-dns',
    name: 'DNS Server (Bind)',
    description: 'Manage your own DNS zones and records directly from the panel.',
    category: 'Tool',
    icon: Globe,
    image: 'https://picsum.photos/seed/dns/400/200',
    stars: 4.5,
    downloads: '1M+',
    version: '9.18.24'
  },
  {
    id: 'mail-server-pro',
    name: 'Mail Server Pro',
    description: 'Complete enterprise mail server solution with Anti-Spam and Anti-Virus.',
    category: 'Tool',
    icon: Shield,
    image: 'https://picsum.photos/seed/mail/400/200',
    stars: 4.9,
    downloads: '500K+',
    version: '3.0.0',
    price: 15.99,
    isPro: true
  },

  // --- SECURITY ---
  {
    id: 'fail2ban',
    name: 'Fail2ban',
    description: 'Ban IPs that show malicious signs -- too many password failures, etc.',
    category: 'Security',
    icon: Shield,
    image: 'https://picsum.photos/seed/fail2ban/400/200',
    stars: 4.9,
    downloads: '10M+',
    version: '1.0.2'
  },
  {
    id: 'sys-firewall',
    name: 'System Firewall',
    description: 'Manage UFW/Firewalld rules easily through the visual interface.',
    category: 'Security',
    icon: Shield,
    image: 'https://picsum.photos/seed/firewall/400/200',
    stars: 4.8,
    downloads: '12M+',
    version: '1.5.0'
  },
  {
    id: 'nginx-waf',
    name: 'Nginx WAF Pro',
    description: 'Web Application Firewall for Nginx. Protects against SQLi, XSS, and more.',
    category: 'Security',
    icon: Shield,
    image: 'https://picsum.photos/seed/nginxwaf/400/200',
    stars: 5.0,
    downloads: '200K+',
    version: '2.1.0',
    price: 19.99,
    isPro: true
  },
  {
    id: 'apache-waf',
    name: 'Apache WAF Pro',
    description: 'Web Application Firewall for Apache based on ModSecurity.',
    category: 'Security',
    icon: Shield,
    image: 'https://picsum.photos/seed/apachewaf/400/200',
    stars: 4.8,
    downloads: '150K+',
    version: '2.0.5',
    price: 19.99,
    isPro: true
  },
  {
    id: 'anti-intrusion',
    name: 'Anti-Intrusion Pro',
    description: 'Real-time file tampering detection and malware scanning.',
    category: 'Security',
    icon: Shield,
    image: 'https://picsum.photos/seed/antiintrusion/400/200',
    stars: 4.9,
    downloads: '100K+',
    version: '3.0.1',
    price: 24.99,
    isPro: true
  },

  // --- PLUGINS & BACKUPS ---
  {
    id: 'ftp-backup',
    name: 'FTP Storage',
    description: 'Backup your websites and databases to a remote FTP server.',
    category: 'Plugin',
    icon: Download,
    image: 'https://picsum.photos/seed/ftpbackup/400/200',
    stars: 4.7,
    downloads: '3M+',
    version: '1.2.0'
  },
  {
    id: 'gdrive-backup',
    name: 'Google Drive Backup',
    description: 'Automated backups directly to your Google Drive account.',
    category: 'Plugin',
    icon: Database,
    image: 'https://picsum.photos/seed/gdrive/400/200',
    stars: 4.9,
    downloads: '1M+',
    version: '2.0.0',
    price: 4.99,
    isPro: true
  },
  {
    id: 's3-backup',
    name: 'AWS S3 Backup',
    description: 'Enterprise-grade automated backups to Amazon S3 or compatible storage.',
    category: 'Plugin',
    icon: Database,
    image: 'https://picsum.photos/seed/s3/400/200',
    stars: 4.8,
    downloads: '500K+',
    version: '1.5.0',
    price: 9.99,
    isPro: true
  },
  {
    id: 'website-speed',
    name: 'Website Speed Pro',
    description: 'One-click optimization for static assets, image compression, and caching.',
    category: 'Plugin',
    icon: Zap,
    image: 'https://picsum.photos/seed/speed/400/200',
    stars: 4.9,
    downloads: '300K+',
    version: '2.2.0',
    price: 14.99,
    isPro: true
  },

  // --- CMS & ONE-CLICK APPS ---
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'One-click deployment for the world\'s most popular CMS.',
    category: 'CMS',
    icon: Globe,
    image: 'https://picsum.photos/seed/wordpress/400/200',
    stars: 4.9,
    downloads: '50M+',
    version: '6.4.3'
  },
  {
    id: 'zblog',
    name: 'Z-BlogPHP',
    description: 'A fast, reliable and powerful blog publishing application.',
    category: 'CMS',
    icon: LayoutGrid,
    image: 'https://picsum.photos/seed/zblog/400/200',
    stars: 4.6,
    downloads: '2M+',
    version: '1.7.3'
  },
  {
    id: 'joomla',
    name: 'Joomla!',
    description: 'Award-winning CMS to build websites and powerful online applications.',
    category: 'CMS',
    icon: Globe,
    image: 'https://picsum.photos/seed/joomla/400/200',
    stars: 4.5,
    downloads: '5M+',
    version: '5.0.3'
  },
  {
    id: 'drupal',
    name: 'Drupal',
    description: 'Open source CMS for ambitious digital experiences.',
    category: 'CMS',
    icon: Globe,
    image: 'https://picsum.photos/seed/drupal/400/200',
    stars: 4.6,
    downloads: '3M+',
    version: '10.2.3'
  },
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Professional publishing platform for modern creators.',
    category: 'CMS',
    icon: Zap,
    image: 'https://picsum.photos/seed/ghost/400/200',
    stars: 4.8,
    downloads: '1M+',
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
    downloads: '4M+',
    version: '28.0.2'
  },
  {
    id: 'opencart',
    name: 'OpenCart',
    description: 'Free open source ecommerce platform for online merchants.',
    category: 'CMS',
    icon: ShoppingBag,
    image: 'https://picsum.photos/seed/opencart/400/200',
    stars: 4.7,
    downloads: '2M+',
    version: '3.0.3.9'
  },
  {
    id: 'moodle',
    name: 'Moodle',
    description: 'The world\'s most popular learning management system (LMS).',
    category: 'CMS',
    icon: Globe,
    image: 'https://picsum.photos/seed/moodle/400/200',
    stars: 4.8,
    downloads: '3M+',
    version: '4.3.3'
  },
  {
    id: 'laravel',
    name: 'Laravel Starter',
    description: 'The PHP Framework for Web Artisans. One-click ready environment.',
    category: 'Web',
    icon: Rocket,
    image: 'https://picsum.photos/seed/laravel/400/200',
    stars: 4.9,
    downloads: '10M+',
    version: '11.0.0'
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Get up and running with Llama 3, Mistral, Gemma, and other large language models locally.',
    category: 'AI & ML',
    icon: Zap,
    image: 'https://picsum.photos/seed/ollama/400/200',
    stars: 4.9,
    downloads: '2M+',
    version: '0.1.30',
    isPro: true
  }
];

import { Activity } from 'lucide-react';

export default function MarketplacePage() {
  const { isDemo } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const categories = ['All', 'AI & ML', 'Web', 'Database', 'Tool', 'CMS', 'Security', 'Plugin', 'Premium'];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                          (selectedCategory === 'Premium' ? app.isPro : app.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleDeploy = async (app: App) => {
    if (isDemo) {
      setDeployingId(app.id);
      setTimeout(() => {
        setDeployingId(null);
        toast.success(`Simulation: ${app.name} Deployed`, {
          description: `In a real environment, ${app.name} would be pulled and started via Docker. Container ID: sim-${Math.random().toString(36).substring(7)}`
        });
      }, 2000);
      return;
    }

    if (app.isPro) {
      toast.info(`Premium App: ${app.name}`, {
        description: `This is a Pro feature ($${app.price}/mo). Redirecting to payment...`
      });
      return;
    }

    setDeployingId(app.id);
    
    toast.promise(
      fetch('/api/marketplace/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id, appName: app.name })
      }).then(async res => {
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Deployment failed');
        }
        return data;
      }),
      {
        loading: `Deploying ${app.name} to your server...`,
        success: (data) => {
          setDeployingId(null);
          if (data.deployDir) {
            return `${app.name} deployed to ${data.deployDir}!`;
          }
          return `${app.name} deployed! Container ID: ${data.containerId}`;
        },
        error: (err) => {
          setDeployingId(null);
          return err.message || 'Deployment failed. Please check logs.';
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

      <AdBanner dataAdSlot="0987654321" />

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
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {app.category}
                  </span>
                  {app.isPro && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 backdrop-blur-md border border-amber-400/50 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                      PRO
                    </span>
                  )}
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
                      <p className="text-[10px] font-mono text-slate-500 uppercase">
                        {app.price ? `$${app.price}/mo` : `v${app.version}`}
                      </p>
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
                    ) : app.isPro ? (
                      <>
                        <Zap className="w-4 h-4" />
                        UPGRADE TO PRO
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
