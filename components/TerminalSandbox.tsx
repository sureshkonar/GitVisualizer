'use client';

import { FormEvent, useMemo, useState } from 'react';
import { executeGitCommand } from '@/lib/gitCommands';
import { RepoState } from '@/lib/gitEngine';

interface TerminalSandboxProps {
  state: RepoState;
  onStateChange: (state: RepoState) => void;
}

export default function TerminalSandbox({ state, onStateChange }: TerminalSandboxProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['Type `help` or run a git command.']);

  const prompt = useMemo(() => `${state.currentBranch} $`, [state.currentBranch]);

  const submitCommand = (event: FormEvent) => {
    event.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    const result = executeGitCommand(state, raw);
    onStateChange(result.nextState);

    setHistory((prev) => [
      ...prev,
      `${prompt} ${raw}`,
      result.output || (result.success ? 'OK' : 'No output')
    ]);
    setInput('');
  };

  return (
    <section className="panel flex h-full flex-col p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Git Sandbox</h3>
        <p className="font-mono text-xs text-slate-400">Client-side simulator</p>
      </header>

      <div className="mb-4 flex-1 overflow-auto rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-xs text-slate-200">
        {history.map((line, index) => (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      <form onSubmit={submitCommand} className="flex items-center gap-2 rounded-xl border border-gitBlue/40 bg-black/60 p-2">
        <span className="font-mono text-xs text-gitBlue">{prompt}</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="git branch feature"
          className="w-full bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-500"
        />
      </form>
    </section>
  );
}
