'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CLUB } from '@/lib/data'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notConfigured, setNotConfigured] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    let supabase
    try {
      supabase = createClient()
    } catch {
      setNotConfigured(true)
      setBusy(false)
      return
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-2xl font-black text-white shadow-lg shadow-red-600/30">
              S
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            {CLUB.shortName} <span className="text-red-600">Team Login</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{CLUB.name}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
          {notConfigured ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-400">
                Sign-in isn&apos;t set up yet
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Add <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
                and <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
                to <code className="font-mono text-xs">.env.local</code> to enable login.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-600/40 bg-red-600/10 px-3 py-2 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-xs leading-relaxed text-zinc-500">
            Accounts are created by your coach or club admin.
            <br />
            Need access? Talk to your coach.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-400">
            ← Back to {CLUB.name}
          </Link>
        </p>
      </div>
    </div>
  )
}
