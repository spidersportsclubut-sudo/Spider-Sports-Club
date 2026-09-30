'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CLUB } from '@/lib/data'

function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16 text-zinc-100">
      <div className="mx-auto w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600/15">
          <span className="text-3xl font-bold text-red-500">✓</span>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {sessionId ? 'Payment confirmed' : 'Registration received'}
        </h1>
        <p className="mt-3 text-zinc-400">
          {sessionId
            ? `Your first month of ${CLUB.name} dues is set up. Welcome to the club!`
            : `Your ${CLUB.name} registration has been received. We’ll confirm payment shortly.`}
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left shadow-xl">
          <h2 className="text-lg font-bold">What happens next</h2>
          <ol className="mt-4 space-y-4">
            {[
              {
                title: 'Your coach contacts you',
                detail:
                  'Expect an email or call from your team’s coach with training times and locations.',
              },
              {
                title: 'Evaluation contract',
                detail:
                  'Every new player starts on a 3–6 month evaluation contract — train hard, be coachable, and earn your spot.',
              },
              {
                title: 'Team placement',
                detail:
                  'Final team placement is confirmed by the coach after evaluation, then you’re on the roster.',
              },
            ].map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                  <p className="mt-0.5 text-sm text-zinc-500">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-red-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-red-500"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}

export default function RegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 px-4 py-16 text-center text-zinc-400">
          Loading…
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
