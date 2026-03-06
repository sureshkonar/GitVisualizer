'use client';

import { motion } from 'framer-motion';

type TutorialStep = {
  title: string;
  description: string;
  cta: string;
  view: 'learn' | 'practice' | 'sandbox' | 'progress';
};

interface WebsiteTutorialProps {
  open: boolean;
  currentStep: number;
  steps: TutorialStep[];
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onGoToView: (view: TutorialStep['view']) => void;
}

export default function WebsiteTutorial({
  open,
  currentStep,
  steps,
  onNext,
  onPrev,
  onClose,
  onGoToView
}: WebsiteTutorialProps) {
  if (!open) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.section
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="surface w-full max-w-xl rounded-3xl p-6"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gitBlue">
          Website Tutorial ({currentStep + 1}/{steps.length})
        </p>
        <h3 className="mb-2 text-2xl font-semibold">{step.title}</h3>
        <p className="mb-4 text-sm text-slate-300">{step.description}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => onGoToView(step.view)}
            className="rounded-lg border border-gitBlue/50 bg-gitBlue/10 px-3 py-1.5 text-xs font-semibold text-gitBlue"
          >
            {step.cta}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={currentStep === 0}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={onNext}
              className="rounded-lg bg-gitGreen px-3 py-1.5 text-xs font-semibold text-black"
            >
              {currentStep === steps.length - 1 ? 'Finish Tutorial' : 'Next'}
            </button>
          </div>
          <button onClick={onClose} className="text-xs text-slate-400 underline underline-offset-2">
            Skip
          </button>
        </div>
      </motion.section>
    </div>
  );
}
