'use client';
import { motion } from 'motion/react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior DevOps Engineer',
    quote: 'FYOR OS has completely changed how I manage our server fleet. Jarvis is a game changer.'
  },
  {
    name: 'Marcus Thorne',
    role: 'CTO at TechFlow',
    quote: 'The real-time monitoring and autonomous control are unparalleled in the industry.'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Full Stack Developer',
    quote: 'Deploying websites used to take hours. Now it takes seconds with FYOR OS.'
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-16 text-center">Loved by engineers</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-2xl"
            >
              <p className="text-slate-300 mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500 font-mono uppercase">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
