import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client for Client Components.
 * Throws a clear error when env vars are missing so pages can
 * catch it and show a "not configured" state instead of crashing.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).'
    )
  }
  return createBrowserClient(url, anonKey)
}
