import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AGENTS, type AgentRun } from './roster';
import AgentCard from './AgentCard';
import RunsDropdown from './RunsDropdown';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agent Mission Control | Spider Sports Club',
};

export default async function AgentsPage() {
  let runs: AgentRun[] = [];
  let notice: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('agent_runs')
      .select('id,agent_name,run_at,trigger,summary,output_ref,needs_human,status')
      .order('run_at', { ascending: false })
      .limit(120);
    if (error) throw new Error(error.message);
    runs = (data ?? []) as AgentRun[];
  } catch {
    notice = 'Run data unavailable — the agent_runs table may not exist yet or is not readable.';
  }
  const latest: Record<string, AgentRun> = {};
  for (const r of runs) {
    if (!latest[r.agent_name]) latest[r.agent_name] = r;
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-black text-zinc-100">Agent Mission Control</h1>
      <p className="mt-1 text-sm text-zinc-400">14 club agents · read-only · on-demand runs happen in chat</p>
      {notice && (
        <p className="mt-4 rounded-lg border border-amber-800 bg-amber-950/40 p-3 text-sm text-amber-200">{notice}</p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((a) => (
          <AgentCard key={a.id} agent={a} lastRun={latest[a.id] ?? null} />
        ))}
      </div>
      <h2 className="mt-10 text-lg font-bold text-zinc-100">Recent runs</h2>
      <RunsDropdown agents={AGENTS} runs={runs} />
    </main>
  );
}
