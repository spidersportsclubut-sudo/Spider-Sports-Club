/**
 * Friendly placeholder shown anywhere Supabase is required but not
 * configured yet. Never crashes; just explains the missing setup step.
 */
export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600/15 text-2xl">
        ⚙️
      </div>
      <h2 className="text-xl font-bold text-zinc-100">
        Supabase isn&apos;t connected yet
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        This part of the club app needs a Supabase project. Add
        <code className="mx-1 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
          NEXT_PUBLIC_SUPABASE_URL
        </code>
        and
        <code className="mx-1 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-200">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>
        to your <code className="font-mono text-xs">.env.local</code> file
        (see <code className="font-mono text-xs">.env.example</code>) and reload.
      </p>
    </div>
  )
}
