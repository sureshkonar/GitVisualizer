'use client';

import { motion } from 'framer-motion';
import { learningLevels } from '@/lib/gitChallenges';

interface LearningPathProps {
  focusCommands?: string[];
  learnedCommands?: string[];
  onStartQuest?: (command: string) => void;
}

export default function LearningPath({
  focusCommands = [],
  learnedCommands = [],
  onStartQuest
}: LearningPathProps) {
  const completedInLevel = (commands: string[]) =>
    commands.filter((command) => learnedCommands.includes(command)).length;

  const totalCompleted = learningLevels.reduce(
    (acc, level) => acc + completedInLevel(level.commands),
    0
  );
  const totalCommands = learningLevels.reduce((acc, level) => acc + level.commands.length, 0);

  return (
    <section className="surface rounded-3xl p-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gitBlue">Quest Progression</p>
          <h2 className="text-3xl font-semibold">Gamified Learning Path</h2>
          <p className="text-sm text-slate-300">Clear command quests, unlock levels, and earn capability badges.</p>
        </div>
        <div className="surface-soft rounded-xl px-3 py-2 text-right text-xs">
          <p className="font-mono text-gitGreen">
            {totalCompleted}/{totalCommands} commands mastered
          </p>
          <div className="mt-1 h-1.5 w-44 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gitGreen"
              style={{ width: `${Math.round((totalCompleted / totalCommands) * 100)}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mb-4 hidden gap-2 lg:grid lg:grid-cols-5">
        {learningLevels.map((level, index) => (
          <div key={level.level} className="relative">
            <div
              className={`h-1 rounded-full ${
                index === learningLevels.length - 1 ? 'bg-transparent' : 'bg-gitBlue/30'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {learningLevels.map((level, index) => {
          const completed = completedInLevel(level.commands);
          const percent = Math.round((completed / level.commands.length) * 100);
          const locked = index > 0 && completedInLevel(learningLevels[index - 1].commands) < 2;

          return (
            <motion.article
              key={level.level}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -3 }}
              className={`rounded-2xl p-4 ${locked ? 'border border-white/10 bg-black/30 opacity-65' : 'surface-soft'}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-gitBlue">Level {level.level}</p>
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-slate-300">
                  {locked ? 'Locked' : `${percent}%`}
                </span>
              </div>

              <h3 className="mb-3 text-base font-semibold">{level.title}</h3>

              <ul className="mb-3 space-y-1 text-xs text-slate-300">
                {level.commands.map((command) => {
                  const mastered = learnedCommands.includes(command);
                  const focused = focusCommands.includes(command);
                  return (
                    <li key={command} className="flex items-center gap-2 font-mono text-[11px]">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          mastered ? 'bg-gitGreen' : focused ? 'bg-gitBlue' : 'bg-slate-500'
                        }`}
                      />
                      <span className={`${mastered ? 'text-gitGreen' : focused ? 'text-gitBlue' : ''}`}>
                        {command}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mb-3 text-xs text-gitGreen">{level.reward}</p>

              <button
                disabled={locked}
                onClick={() => onStartQuest?.(level.commands[0])}
                className="w-full rounded-lg border border-gitBlue/40 px-2 py-1 text-[11px] font-semibold text-gitBlue disabled:opacity-40"
              >
                {locked ? 'Complete previous level to unlock' : 'Start Quest'}
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
