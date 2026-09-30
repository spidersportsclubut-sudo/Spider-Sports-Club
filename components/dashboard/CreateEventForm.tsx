'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EventType } from '@/lib/types'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600'

/** Coach/admin form for creating a team event (practice or game). */
export function CreateEventForm({ teamId }: { teamId: string }) {
  const [type, setType] = useState<EventType>('practice')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    if (!startsAt) {
      setError('Please choose a start date and time.')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { error: insertError } = await supabase.from('events').insert({
        team_id: teamId,
        type,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        location: location.trim() || null,
        notes: notes.trim() || null,
      })
      if (insertError) throw insertError
      setSaved(true)
      setType('practice')
      setStartsAt('')
      setEndsAt('')
      setLocation('')
      setNotes('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create the event.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="event-type"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Type
          </label>
          <select
            id="event-type"
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
            className={inputClass}
          >
            <option value="practice">Practice</option>
            <option value="game">Game</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="event-location"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Location
          </label>
          <input
            id="event-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Herriman Field 3"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="event-starts"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Starts at
          </label>
          <input
            id="event-starts"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>
        <div>
          <label
            htmlFor="event-ends"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Ends at <span className="normal-case text-zinc-600">(optional)</span>
          </label>
          <input
            id="event-ends"
            type="datetime-local"
            value={endsAt}
            min={startsAt || undefined}
            onChange={(e) => setEndsAt(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="event-notes"
          className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
        >
          Notes <span className="normal-case text-zinc-600">(optional)</span>
        </label>
        <textarea
          id="event-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Bring water, arrive 15 minutes early…"
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-emerald-400">
          Event created — it now appears on the team calendar. 🎉
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
      >
        {saving ? 'Creating…' : 'Create event'}
      </button>
    </form>
  )
}
