export interface RosterPlayer {
  id: string
  jersey_number: number | null
  position: string | null
  evaluation_score: number | null
  name: string | null
}

/**
 * Presentational roster table. Receives already-resolved players; the
 * evaluation score column is only rendered when viewerIsStaff is true.
 */
export function RosterList({
  players,
  viewerIsStaff,
}: {
  players: RosterPlayer[]
  viewerIsStaff: boolean
}) {
  if (players.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
        No players on this roster yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Player</th>
            <th className="px-4 py-3 font-semibold">Position</th>
            {viewerIsStaff && (
              <th className="px-4 py-3 font-semibold">Eval score</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/70">
          {players.map((p) => (
            <tr key={p.id} className="transition hover:bg-zinc-800/40">
              <td className="px-4 py-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600/15 text-xs font-black text-red-400">
                  {p.jersey_number ?? '–'}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-zinc-100">
                {p.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-zinc-400">{p.position ?? '—'}</td>
              {viewerIsStaff && (
                <td className="px-4 py-3">
                  {p.evaluation_score === null ? (
                    <span className="text-zinc-600">—</span>
                  ) : (
                    <span
                      className={`font-bold ${
                        p.evaluation_score >= 15
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {p.evaluation_score}/15
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
