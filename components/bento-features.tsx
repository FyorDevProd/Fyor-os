'use client';
import { motion } from 'motion/react';
import { Bot, Zap, Container, Terminal, Globe, ShieldAlert } from 'lucide-react';

const features = [
  {
    title: 'Autonomous AI Control',
    description: 'Interact with your server using natural language. FYOR AI translates your requests into bash commands and executes them safely.',
    icon: Bot,
    color: 'cyan',
    className: 'md:col-span-2'
  },
  {
    title: 'Real-time Monitoring',
    description: 'Track CPU, RAM, Disk, and Network usage with live, beautiful charts powered by WebSockets.',
    icon: Zap,
    color: 'fuchsia',
    className: ''
  },
  {
    title: 'Docker Management',
    description: 'Start, stop, and monitor your containers with a visual interface.',
    icon: Container,
    color: 'blue',
    className: ''
  },
  {
    title: 'Secure Terminal',
    description: 'Access your server directly from the browser with a fully-featured, secure SSH terminal.',
    icon: Terminal,
    color: 'emerald',
    className: 'md:col-span-2'
  },
  {
    title: 'Website Deployment',
    description: 'Deploy static sites, Node.js apps, or PHP applications with automatic Nginx configuration.',
    icon: Globe,
    color: 'purple',
    className: ''
  },
  {
    title: 'Advanced Security',
    description: 'Manage UFW firewall rules, monitor SSH logins, and block malicious IPs with one click.',
    icon: ShieldAlert,
    color: 'rose',
    className: ''
  }
];

export default function BentoFeatures() {
  return (
    <section id="features" className="py-24 px-6 bg-black/50 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Everything you need to scale</h2>
          <p className="text-slate-400 font-mono">Replace 10 different tools with one intelligent dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-cyan-500/30 transition-all group ${feature.className}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
