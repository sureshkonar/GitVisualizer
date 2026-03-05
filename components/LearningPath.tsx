'use client';

import { motion } from 'framer-motion';
import { learningLevels } from '@/lib/gitChallenges';

export default function LearningPath() {
  return (
    <section className="panel grid-bg bg-grid bg-[length:24px_24px] p-6">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Gamified Learning Path</h2>
        <p className="text-sm text-slate-300">Progress from fundamentals to advanced repository surgery.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-5">
        {learningLevels.map((level, index) => (
          <motion.article
            key={level.level}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-white/10 bg-black/30 p-4"
          >
            <p className="mb-1 text-xs uppercase tracking-widest text-gitBlue">Level {level.level}</p>
            <h3 className="mb-3 font-semibold">{level.title}</h3>
            <ul className="mb-4 space-y-1 text-xs text-slate-300">
              {level.commands.map((command) => (
                <li key={command} className="font-mono">
                  {command}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gitGreen">{level.reward}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
