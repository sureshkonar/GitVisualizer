'use client';

import { useEffect, useMemo, useState } from 'react';
import { executeGitCommand } from '@/lib/gitCommands';
import { RepoState } from '@/lib/gitEngine';

type TerminalSandboxProps = {
  state: RepoState;
  onStateChange: (state: RepoState) => void;
  onCommand?: (command: string, success: boolean, nextState: RepoState) => void;
  resetSignal?: number;
};

const INITIAL_HISTORY = [
  'Sandbox booted. Type help or run a git command.',
  'Try: git branch feature'
];

export default function TerminalSandbox({ state, onStateChange, onCommand, resetSignal = 0 }: TerminalSandboxProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(INITIAL_HISTORY);

  useEffect(() => {
    setInput('');
    setHistory(INITIAL_HISTORY);
  }, [resetSignal]);

  const prompt = useMemo(() => `${state.currentBranch} $`, [state.currentBranch]);

  const submitCommand = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const raw = input.trim();
    if (!raw) return;

    const result = executeGitCommand(state, raw);
    onStateChange(result.nextState);
    onCommand?.(raw, result.success, result.nextState);

    const output = result.output || (result.success ? 'OK' : 'No output');
    setHistory((prev) => [...prev, `${prompt} ${raw}`, output]);
    setInput('');
  };

  return (
    <section className="surface flex h-full flex-col rounded-2xl p-4">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Live Git Sandbox</h3>
          <p className="text-xs text-slate-400">Command interpreter + state machine</p>
        </div>
        <p className="rounded-full border border-gitGreen/30 bg-gitGreen/10 px-2 py-1 font-mono text-[11px] text-gitGreen">
          client runtime
        </p>
      </header>

      <div className="mb-4 flex gap-2 text-[11px] text-slate-400">
        <span className="rounded-full border border-white/10 px-2 py-1">graph sync</span>
        <span className="rounded-full border border-white/10 px-2 py-1">reflog tracking</span>
        <span className="rounded-full border border-white/10 px-2 py-1">challenge aware</span>
      </div>

      <div className="surface-soft mb-4 flex-1 overflow-auto rounded-xl p-3 font-mono text-xs text-slate-200">
        {history.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      <form onSubmit={submitCommand} className="surface-soft flex items-center gap-2 rounded-xl p-2">
        <span className="rounded-md bg-gitBlue/15 px-2 py-1 font-mono text-xs text-gitBlue">{prompt}</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={'git commit -m "feature"'}
          className="w-full bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-500"
        />
      </form>
    </section>
  );
}
