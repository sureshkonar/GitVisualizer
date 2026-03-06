'use client';

import { motion } from 'framer-motion';
import { ExperienceLevel } from '@/lib/gitChallenges';

interface OnboardingModalProps {
  open: boolean;
  onSelect: (level: ExperienceLevel) => void;
}

const options: { level: ExperienceLevel; label: string; detail: string }[] = [
  { level: 'Beginner', label: 'Beginner', detail: 'I have never used Git' },
  { level: 'Intermediate', label: 'Intermediate', detail: 'I know commits and branches' },
  { level: 'Advanced', label: 'Advanced', detail: 'I want deeper Git knowledge' }
];

export default function OnboardingModal({ open, onSelect }: OnboardingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="surface w-full max-w-2xl rounded-3xl p-6"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gitBlue">Welcome to Git Visualizer</p>
        <h2 className="mb-2 text-3xl font-semibold">What is your Git experience level?</h2>
        <p className="mb-5 text-sm text-slate-400">Select your track. We will personalize command flow and learning progression.</p>

        <div className="grid gap-3 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.level}
              onClick={() => onSelect(option.level)}
              className="surface-soft rounded-2xl p-4 text-left transition hover:border-gitBlue/50"
            >
              <p className="mb-1 text-base font-semibold text-slate-100">{option.label}</p>
              <p className="text-xs text-slate-400">{option.detail}</p>
            </button>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
