'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CLUB, DIVISIONS, DEMO_TEAMS, type DemoTeam } from '@/lib/data'

const STEPS = ['Player', 'Parent', 'Agreement', 'Review'] as const

const TERMS = [
  {
    id: 'commitment',
    label: '6–12 month non-refundable commitment',
    detail:
      'Player agreements run 6–12 months and are non-refundable. Dues cover training, coaching, and club operations.',
  },
  {
    id: 'dues',
    label: '$150/month due between the 1st and the 5th',
    detail: `Monthly club dues are $${CLUB.monthlyFee} per player, due between ${CLUB.paymentWindow}.`,
  },
  {
    id: 'late',
    label: `$${CLUB.lateFee} late fee`,
    detail: `Payments made after the 5th incur a $${CLUB.lateFee} late fee.`,
  },
  {
    id: 'termination',
    label: 'Early termination penalty equals 2 months of club fees',
    detail:
      'Ending the agreement before the commitment period results in a penalty equal to 2 months of club fees.',
  },
] as const

/** Whole years between the given YYYY-MM-DD date of birth and today. Null when empty/invalid. */
function ageFromDob(dob: string): number | null {
  if (!dob) return null
  const birth = new Date(`${dob}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--
  return age
}

/** The age cap parsed from a division label like 'Girls U12' → 12. Null when unparseable. */
function divisionMaxAge(division: string): number | null {
  const match = /U(\d+)/.exec(division)
  return match ? parseInt(match[1], 10) : null
}

export default function RegisterPage() {  useEffect(() => {
    document.title = 'Register | Spider Sports Club'
  }, [])
const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — player
  const [playerName, setPlayerName] = useState('')
  const [dob, setDob] = useState('')
  const [division, setDivision] = useState('')
  const [teamId, setTeamId] = useState('')
  const [teams, setTeams] = useState<DemoTeam[]>([])

  // Step 2 — parent/guardian
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentPhone, setParentPhone] = useState('')

  // Step 3 — agreement checkboxes
  const [accepted, setAccepted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    if (!division) {
      setTeams([])
      setTeamId('')
      return
    }
    async function loadTeams() {
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('teams')
          .select('id, name, division, city')
          .eq('division', division)
        if (fetchError || !data) throw new Error('teams fetch failed')
        if (!cancelled) {
          setTeams(
            data.map((t) => ({
              id: t.id as string,
              name: t.name as string,
              division: t.division as string,
              city: (t.city as string) ?? '',
            }))
          )
        }
      } catch {
        // Supabase not configured or fetch failed — fall back to demo teams.
        if (!cancelled) setTeams(DEMO_TEAMS.filter((t) => t.division === division))
      }
    }
    setTeamId('')
    void loadTeams()
    return () => {
      cancelled = true
    }
  }, [division])

  // Age gating: a player is only eligible for divisions whose age cap is at or
  // above their age (under or right on — never over). A 45-year-old therefore
  // sees no youth divisions at all.
  const playerAge = ageFromDob(dob)
  const eligibleDivisions = DIVISIONS.filter((d) => {
    if (playerAge == null || playerAge < 0) return true
    const max = divisionMaxAge(d)
    return max != null && playerAge <= max
  })

  const handleDobChange = (nextDob: string) => {
    setDob(nextDob)
    // If the previously chosen division no longer fits the new age, clear it
    // (clearing the division also clears the team list via the effect above).
    if (division) {
      const age = ageFromDob(nextDob)
      const max = divisionMaxAge(division)
      if (age == null || age < 0 || max == null || age > max) setDivision('')
    }
  }

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!playerName.trim()) return 'Please enter the player’s full name.'
      if (!dob) return 'Please enter the player’s date of birth.'
      if (playerAge != null && playerAge < 0)
        return 'Please enter a valid date of birth.'
      if (eligibleDivisions.length === 0)
        return 'Based on the date of birth, the player is older than our oldest youth division (U16). Please contact the club about other options.'
      if (!division) return 'Please choose a division.'
      return null
    }
    if (s === 2) {
      if (!parentName.trim()) return 'Please enter the parent or guardian’s name.'
      if (!parentEmail.trim()) return 'Please enter the parent or guardian’s email.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail.trim()))
        return 'Please enter a valid email address.'
      return null
    }
    if (s === 3) {
      const missing = TERMS.filter((t) => !accepted[t.id])
      if (missing.length > 0) return 'Please accept all four agreement terms to continue.'
      return null
    }
    return null
  }

  const next = () => {
    const problem = validateStep(step)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    setStep((s) => Math.min(4, s + 1))
  }

  const back = () => {
    setError(null)
    setStep((s) => Math.max(1, s - 1))
  }

  const submit = async () => {
    setError(null)
    setSubmitting(true)
    let registrationId: string
    try {
      const supabase = createClient()
      const { data, error: insertError } = await supabase
        .from('registrations')
        .insert({
          player_name: playerName.trim(),
          division,
          team_id: teamId || null,
          parent_name: parentName.trim(),
          parent_email: parentEmail.trim(),
          parent_phone: parentPhone.trim() || null,
          agreement_accepted: true,
          status: 'pending',
        })
        .select('id')
        .single()
      if (insertError || !data) throw insertError ?? new Error('insert failed')
      registrationId = data.id as string
    } catch {
      // Supabase not configured — continue in demo mode with a local id.
      setDemoMode(true)
      registrationId = crypto.randomUUID()
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, parentEmail: parentEmail.trim(), division }),
      })
      const body = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !body.url) throw new Error(body.error ?? 'Checkout failed')
      window.location.href = body.url
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong starting checkout. Please try again.'
      )
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/30'

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="text-sm font-medium text-red-500 hover:text-red-400">
          ← Back to {CLUB.shortName}
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Player <span className="text-red-600">Registration</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          Join {CLUB.name}. Complete all four steps, then check out to start monthly dues.
        </p>

        {/* Progress indicator */}
        <ol className="mt-8 flex items-center gap-1 sm:gap-2" aria-label="Registration progress">
          {STEPS.map((label, i) => {
            const n = i + 1
            const done = n < step
            const current = n === step
            return (
              <li key={label} className="flex flex-1 items-center">
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      done
                        ? 'bg-red-600 text-white'
                        : current
                          ? 'border-2 border-red-600 bg-zinc-900 text-red-500'
                          : 'border border-zinc-700 bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {done ? '✓' : n}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      current ? 'text-zinc-100' : 'text-zinc-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {n < STEPS.length && (
                  <span
                    aria-hidden
                    className={`mb-6 h-0.5 flex-1 rounded ${done ? 'bg-red-600' : 'bg-zinc-800'}`}
                  />
                )}
              </li>
            )
          })}
        </ol>

        {demoMode && (
          <div className="mt-6 rounded-lg border border-amber-600/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-300">
            Demo mode — the database isn’t connected, so this registration won’t be saved.
            Everything else works the same.
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-700/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Step 1 — Player */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Step 1 — Player details</h2>
              <div>
                <label htmlFor="playerName" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Jordan Mensah"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="dob" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Date of birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className={`${inputClass} [color-scheme:dark]`}
                  />
                  {dob && playerAge != null && playerAge >= 0 && (
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Age: {playerAge} — showing divisions the player is eligible for.
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="division" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="division"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">
                      {eligibleDivisions.length === 0
                        ? 'No eligible divisions for this age'
                        : 'Select a division…'}
                    </option>
                    {eligibleDivisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {dob && eligibleDivisions.length === 0 && (
                    <p className="mt-1.5 text-xs text-amber-400">
                      Based on this date of birth, the player is older than our oldest
                      youth division (U16). Please contact the club about other options.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="team" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Preferred team
                </label>
                <select
                  id="team"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  disabled={!division}
                  className={`${inputClass} disabled:opacity-50`}
                >
                  <option value="">
                    {!division
                      ? 'Choose a division first…'
                      : teams.length === 0
                        ? 'No teams listed yet for this division'
                        : 'No preference'}
                  </option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Final team placement is confirmed by the coach after evaluation.
                </p>
              </div>
            </div>
          )}

          {/* Step 2 — Parent/guardian */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Step 2 — Parent or guardian</h2>
              <div>
                <label htmlFor="parentName" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="parentName"
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Ama Mensah"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="parentEmail" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="parentEmail"
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Receipts and payment reminders go here.
                  </p>
                </div>
                <div>
                  <label htmlFor="parentPhone" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Phone
                  </label>
                  <input
                    id="parentPhone"
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="(801) 555-0123"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Agreement */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Step 3 — Club agreement</h2>
              <p className="text-sm text-zinc-400">
                Please read and accept each term below. All four are required to register.
              </p>
              <div className="space-y-3">
                {TERMS.map((term) => (
                  <label
                    key={term.id}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                      accepted[term.id]
                        ? 'border-red-600/60 bg-red-950/20'
                        : 'border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!accepted[term.id]}
                      onChange={(e) =>
                        setAccepted((prev) => ({ ...prev, [term.id]: e.target.checked }))
                      }
                      className="mt-1 h-5 w-5 shrink-0 accent-red-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-zinc-100">
                        {term.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-500">{term.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Step 4 — Review & submit</h2>
              <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
                {[
                  ['Player', playerName],
                  ['Date of birth', dob],
                  ['Division', division],
                  [
                    'Preferred team',
                    teams.find((t) => t.id === teamId)?.name ?? 'No preference',
                  ],
                  ['Parent / guardian', parentName],
                  ['Email', parentEmail],
                  ['Phone', parentPhone || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <dt className="text-zinc-500">{label}</dt>
                    <dd className="text-right font-medium text-zinc-100">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
                Monthly dues: <span className="font-bold text-zinc-100">${CLUB.monthlyFee}/month</span>{' '}
                — you’ll be taken to secure checkout to set up your subscription.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={back}
              disabled={step === 1 || submitting}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-500"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Starting checkout…' : 'Submit & pay dues'}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          {CLUB.name} · {CLUB.homeCity} · Payments secured by Stripe
        </p>
      </div>
    </main>
  )
}
