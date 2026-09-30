'use client'

import { useMemo, useState } from 'react'
import type { ClubEvent } from '@/lib/types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/** Month grid with event dots; clicking a day/event shows details below. */
export function CalendarGrid({ events }: { events: ClubEvent[] }) {
  const [cursor, setCursor] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )
  const [selected, setSelected] = useState<string | null>(() => dayKey(new Date()))

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const startOffset = first.getDay()
    return Array.from(
      { length: 42 },
      (_, i) =>
        new Date(first.getFullYear(), first.getMonth(), 1 - startOffset + i)
    )
  }, [cursor])

  const byDay = useMemo(() => {
    const map = new Map<string, ClubEvent[]>()
    for (const e of events) {
      const key = dayKey(new Date(e.starts_at))
      const list = map.get(key)
      if (list) list.push(e)
      else map.set(key, [e])
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    }
    return map
  }, [events])

  const selectedEvents = selected ? (byDay.get(selected) ?? []) : []
  const inCursorMonth = (d: Date) => d.getMonth() === cursor.getMonth()
  const monthLabel = cursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          aria-label="Previous month"
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-red-600/60 hover:text-white"
        >
          ←
        </button>
        <h3 className="text-base font-bold">{monthLabel}</h3>
        <button
          type="button"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          aria-label="Next month"
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-red-600/60 hover:text-white"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            {d}
          </div>
        ))}
        {cells.map((d) => {
          const key = dayKey(d)
          const dayEvents = byDay.get(key) ?? []
          const isSelected = key === selected
          const isToday = key === dayKey(new Date())
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`flex min-h-[3.5rem] flex-col items-center justify-start rounded-lg border p-1 transition ${
                isSelected
                  ? 'border-red-600 bg-red-600/10'
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
              } ${inCursorMonth(d) ? '' : 'opacity-35'}`}
            >
              <span
                className={`text-xs font-bold ${
                  isToday ? 'text-red-400' : 'text-zinc-200'
                }`}
              >
                {d.getDate()}
              </span>
              <span className="mt-1 flex flex-wrap justify-center gap-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    title={e.type}
                    className={`h-2 w-2 rounded-full ${
                      e.type === 'game' ? 'bg-red-500' : 'bg-sky-400'
                    }`}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] leading-none text-zinc-500">
                    +{dayEvents.length - 3}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        {selected ? (
          <>
            <p className="mb-3 text-sm font-bold text-zinc-200">
              {formatFull(`${selected}T12:00:00`)}
            </p>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-zinc-500">No events this day.</p>
            ) : (
              <ul className="space-y-3">
                {selectedEvents.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                          e.type === 'game'
                            ? 'bg-red-600/15 text-red-300'
                            : 'bg-sky-600/15 text-sky-300'
                        }`}
                      >
                        {e.type}
                      </span>
                      <span className="text-sm font-semibold text-zinc-100">
                        {formatTime(e.starts_at)}
                        {e.ends_at ? ` – ${formatTime(e.ends_at)}` : ''}
                      </span>
                    </div>
                    {e.location && (
                      <p className="mt-1 text-sm text-zinc-400">
                        📍 {e.location}
                      </p>
                    )}
                    {e.notes && (
                      <p className="mt-1 text-sm text-zinc-500">{e.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500">Select a day to see details.</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Practice
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Game
          </span>
        </div>
      </div>
    </div>
  )
}
