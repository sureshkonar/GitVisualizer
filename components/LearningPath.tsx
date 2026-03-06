'use client';

import { motion } from 'framer-motion';
import { learningLevels } from '@/lib/gitChallenges';

interface LearningPathProps {
  focusCommands?: string[];
}

export default function LearningPath({ focusCommands = [] }: LearningPathProps) {
  return (
    <section className="surface rounded-3xl p-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gitBlue">Level Progression</p>
          <h2 className="text-3xl font-semibold">Gamified Learning Path</h2>
          <p className="text-sm text-slate-300">Progress from fundamentals to advanced repository surgery.</p>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-5">
        {learningLevels.map((level, index) => (
          <motion.article
            key={level.level}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -3 }}
            className="surface-soft rounded-2xl p-4"
          >
            <p className="mb-1 text-xs uppercase tracking-widest text-gitBlue">Level {level.level}</p>
            <h3 className="mb-3 text-base font-semibold">{level.title}</h3>
            <ul className="mb-4 space-y-1 text-xs text-slate-300">
              {level.commands.map((command) => (
                <li
                  key={command}
                  className={`font-mono text-[11px] ${
                    focusCommands.includes(command) ? 'text-gitGreen' : ''
                  }`}
                >
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
