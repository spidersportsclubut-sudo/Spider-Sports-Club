tsx
'use client';

import { useState } from 'react';
import type { AgentMeta, AgentRun } from './roster';

export default function RunsDropdown({ agents, runs }: { agents: AgentMeta[]; runs: AgentRun[] }) {
  const [id, setId] = useState(agents[0]?.id ?? '');
  const filtered = runs.filter((r) => r.agent_name === id).slice(0, 20);
  return (
    <div className="mt-3">
      <select
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-100"
      >
        {agents.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      {filtered.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No runs logged for this agent yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {filtered.map((r) => (
            <li key={r.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{new Date(r.run_at).toLocaleString()} · {r.trigger}</span>
                <span>{r.status}{r.needs_human ? ' · needs human' : ''}</span>
              </div>
              <p className="mt-1 text-zinc-200">{r.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
