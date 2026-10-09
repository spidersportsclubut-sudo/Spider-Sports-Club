tsx
import type { AgentMeta, AgentRun } from './roster';

const STATUS_DOT: Record<string, string> = {
  ok: 'bg-emerald-500',
  partial: 'bg-amber-500',
  failed: 'bg-red-500',
};

export default function AgentCard({ agent, lastRun }: { agent: AgentMeta; lastRun: AgentRun | null }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-zinc-100">{agent.name}</h3>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">{agent.squad}</span>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{agent.role}</p>
      <p className="mt-2 text-xs text-zinc-500">Schedule: {agent.schedule}</p>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className={`h-2 w-2 rounded-full ${lastRun ? STATUS_DOT[lastRun.status] ?? 'bg-zinc-500' : 'bg-zinc-600'}`} />
        {lastRun ? (
          <span className="text-zinc-400">
            Last run {new Date(lastRun.run_at).toLocaleString()} · {lastRun.status}
            {lastRun.needs_human && <span className="ml-1 font-semibold text-amber-300">· needs human</span>}
          </span>
        ) : (
          <span className="text-zinc-500">No runs logged yet</span>
        )}
      </div>
    </div>
  );
}
