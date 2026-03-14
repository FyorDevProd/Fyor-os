'use client';
import { motion } from 'motion/react';

const companies = ['GitHub', 'Docker', 'Nginx', 'MySQL', 'Redis'];

export default function TrustedBy() {
  return (
    <section className="py-12 px-6 border-y border-white/5 bg-black/30">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest mb-8">Trusted by industry leaders</p>
        <div className="flex flex-wrap justify-center gap-12 opacity-50">
          {companies.map((company) => (
            <span key={company} className="text-2xl font-black text-slate-400 font-mono">{company}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
