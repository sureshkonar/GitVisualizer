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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="panel p-5"
    >
      <div className="mb-3 inline-flex rounded-full border border-gitBlue/40 bg-gitBlue/10 px-3 py-1 font-mono text-xs text-gitBlue">
        {command}
      </div>
      <p className="mb-4 text-sm text-slate-300">{summary}</p>
      <div className="grid gap-4 font-mono text-xs text-slate-300 md:grid-cols-2">
        <pre className="rounded-xl border border-white/10 bg-black/40 p-3">{beforeGraph}</pre>
        <pre className="rounded-xl border border-white/10 bg-black/40 p-3">{afterGraph}</pre>
      </div>
    </motion.article>
  );
}
