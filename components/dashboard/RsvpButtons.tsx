'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RsvpStatus } from '@/lib/types'

const OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: 'going', label: 'Going' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'out', label: "Can't go" },
]

const BUTTON_STYLES: Record<RsvpStatus, string> = {
  going:
    'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500',
  maybe: 'bg-amber-500 border-amber-500 text-zinc-950 hover:bg-amber-400',
  out: 'bg-red-600 border-red-600 text-white hover:bg-red-500',
}

/** Three RSVP buttons that upsert into `rsvps` on (event_id, player_id). */
export function RsvpButtons({
  eventId,
  playerId,
  initialStatus,
  onChange,
}: {
  eventId: string
  playerId: string
  initialStatus: RsvpStatus | null
  onChange?: (status: RsvpStatus) => void
}) {
  const [status, setStatus] = useState<RsvpStatus | null>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function choose(next: RsvpStatus) {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: upsertError } = await supabase.from('rsvps').upsert(
        { event_id: eventId, player_id: playerId, status: next },
        { onConflict: 'event_id,player_id' }
      )
      if (upsertError) throw upsertError
      setStatus(next)
      onChange?.(next)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not save your RSVP.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const active = status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              disabled={saving}
              onClick={() => choose(opt.value)}
              className={`rounded-lg border px-4 py-1.5 text-sm font-bold transition disabled:opacity-50 ${
                active
                  ? BUTTON_STYLES[opt.value]
                  : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

/** Live counts of going / maybe / out for one event. */
export function RsvpSummary({
  eventId,
  refreshKey = 0,
}: {
  eventId: string
  refreshKey?: number
}) {
  const [counts, setCounts] = useState<Record<RsvpStatus, number>>({
    going: 0,
    maybe: 0,
    out: 0,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('rsvps')
          .select('status')
          .eq('event_id', eventId)
        if (cancelled) return
        const next: Record<RsvpStatus, number> = { going: 0, maybe: 0, out: 0 }
        for (const row of data ?? []) {
          const s = row.status as RsvpStatus
          if (s === 'going' || s === 'maybe' || s === 'out') next[s] += 1
        }
        setCounts(next)
      } catch {
        // Leave zeros; counts are a nice-to-have.
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [eventId, refreshKey])

  const total = counts.going + counts.maybe + counts.out

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="font-bold text-emerald-400">
        ✓ {counts.going} going
      </span>
      <span className="font-bold text-amber-400">? {counts.maybe} maybe</span>
      <span className="font-bold text-red-400">✕ {counts.out} out</span>
      <span className="text-zinc-600">({total} responses)</span>
    </div>
  )
}

export interface RsvpPlayer {
  id: string
  label: string
}

/**
 * Per-event RSVP panel: live summary plus one button set per player row
 * the current user has on the roster.
 */
export function EventRsvp({
  eventId,
  players,
  initialStatuses,
}: {
  eventId: string
  players: RsvpPlayer[]
  initialStatuses: Record<string, RsvpStatus | null>
}) {
  const [tick, setTick] = useState(0)

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <RsvpSummary eventId={eventId} refreshKey={tick} />
      {players.length === 0 ? (
        <p className="text-xs text-zinc-500">
          Your account isn&apos;t linked to a player on this roster — ask your
          coach if your RSVP is missing.
        </p>
      ) : (
        players.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400">
              {p.label}:
            </span>
            <RsvpButtons
              eventId={eventId}
              playerId={p.id}
              initialStatus={initialStatuses[p.id] ?? null}
              onChange={() => setTick((t) => t + 1)}
            />
          </div>
        ))
      )}
    </div>
  )
}
