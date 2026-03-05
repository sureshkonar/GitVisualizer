'use client';

import { motion } from 'framer-motion';

interface CommandCardProps {
  command: string;
  summary: string;
  beforeGraph: string;
  afterGraph: string;
}

export default function CommandCard({ command, summary, beforeGraph, afterGraph }: CommandCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{ y: -3 }}
      className="surface rounded-2xl p-5"
    >
      <div className="mb-3 inline-flex rounded-full border border-gitBlue/35 bg-gitBlue/10 px-3 py-1 font-mono text-xs text-gitBlue">
        {command}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{summary}</p>
      <div className="grid gap-3 font-mono text-xs text-slate-300 md:grid-cols-2">
        <pre className="surface-soft overflow-x-auto rounded-xl p-3">{beforeGraph}</pre>
        <pre className="surface-soft overflow-x-auto rounded-xl p-3">{afterGraph}</pre>
      </div>
    </motion.article>
  );
}
