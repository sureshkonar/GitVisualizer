'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CommandDoc, commandDocs } from '@/lib/gitChallenges';

type Category = CommandDoc['category'];

const categories: Category[] = [
  'Repository Setup',
  'Tracking Changes',
  'Branching',
  'Collaboration',
  'History Manipulation',
  'Advanced Tools'
];

interface CommandExplorerProps {
  onSelectCommand: (command: string) => void;
}

export default function CommandExplorer({ onSelectCommand }: CommandExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('Repository Setup');
  const [activeCommand, setActiveCommand] = useState<CommandDoc>(commandDocs[0]);

  const scoped = useMemo(
    () => commandDocs.filter((doc) => doc.category === activeCategory),
    [activeCategory]
  );

  return (
    <section className="surface rounded-2xl p-5">
      <header className="mb-4">
        <h3 className="text-2xl font-semibold">Command Explorer</h3>
        <p className="text-xs text-slate-400">Definitions and links mapped to git-scm docs.</p>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              const first = commandDocs.find((doc) => doc.category === category);
              if (first) setActiveCommand(first);
            }}
            className={`rounded-full px-3 py-1 text-xs ${
              activeCategory === category
                ? 'bg-gitBlue/20 text-gitBlue border border-gitBlue/50'
                : 'border border-white/15 text-slate-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-soft max-h-[360px] space-y-2 overflow-auto rounded-xl p-3">
          {scoped.map((doc) => (
            <button
              key={doc.command}
              onClick={() => setActiveCommand(doc)}
              className={`block w-full rounded-lg border px-3 py-2 text-left font-mono text-xs transition ${
                activeCommand.command === doc.command
                  ? 'border-gitGreen/50 bg-gitGreen/10 text-gitGreen'
                  : 'border-white/10 text-slate-300 hover:border-white/25'
              }`}
            >
              {doc.command}
            </button>
          ))}
        </div>

        <motion.article
          key={activeCommand.command}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-soft rounded-xl p-4"
        >
          <p className="mb-2 inline-flex rounded-full border border-gitBlue/40 bg-gitBlue/10 px-2 py-1 font-mono text-[11px] text-gitBlue">
            {activeCommand.command}
          </p>
          <p className="mb-2 text-sm text-slate-100">{activeCommand.summary}</p>
          <p className="mb-4 text-xs text-slate-400">Use case: {activeCommand.useCase}</p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectCommand(activeCommand.command)}
              className="rounded-lg bg-gitGreen px-3 py-1.5 text-xs font-semibold text-black"
            >
              Simulate Command
            </button>
            <a
              href={activeCommand.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gitBlue/50 px-3 py-1.5 text-xs font-semibold text-gitBlue"
            >
              Open Official Docs
            </a>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
