'use client'

import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage } from '@/lib/types'

const PAGE_SIZE = 50

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function TeamChat({
  teamId,
  currentUserId,
  currentUserName,
}: {
  teamId: string
  currentUserId: string
  currentUserName: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [notConfigured, setNotConfigured] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    let cancelled = false
    let supabase: ReturnType<typeof createClient> | null = null

    async function init() {
      try {
        supabase = createClient()
      } catch {
        setNotConfigured(true)
        return
      }

      const { data: rows } = await supabase
        .from('messages')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true })
        .limit(PAGE_SIZE)

      const list = ((rows ?? []) as ChatMessage[]).slice(-PAGE_SIZE)
      const senderIds = [
        ...new Set(list.map((m) => m.sender_id).filter(Boolean)),
      ] as string[]
      const names: Record<string, string> = {}
      if (senderIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', senderIds)
        for (const p of (profs ?? []) as { id: string; full_name: string | null }[]) {
          names[p.id] = p.full_name ?? 'Team member'
        }
      }
      if (cancelled) return
      setMessages(
        list.map((m) => ({
          ...m,
          sender_name: m.sender_id ? (names[m.sender_id] ?? null) : null,
        }))
      )

      channel = supabase
        .channel(`team-chat-${teamId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `team_id=eq.${teamId}`,
          },
          async (payload) => {
            const row = payload.new as ChatMessage
            let name: string | null = null
            if (row.sender_id) {
              if (row.sender_id === currentUserId) {
                name = currentUserName
              } else if (supabase) {
                const { data } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('id', row.sender_id)
                  .maybeSingle()
                name =
                  (data as { full_name: string | null } | null)?.full_name ??
                  null
              }
            }
            setMessages((prev) =>
              prev.some((m) => m.id === row.id)
                ? prev
                : [...prev, { ...row, sender_name: name }]
            )
          }
        )
        .subscribe()
    }

    init()

    return () => {
      cancelled = true
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: insertError } = await supabase.from('messages').insert({
        team_id: teamId,
        sender_id: currentUserId,
        body,
      })
      if (insertError) throw insertError
      setDraft('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not send your message.'
      )
    } finally {
      setSending(false)
    }
  }

  if (notConfigured) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
        Chat needs a Supabase connection to work.
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <div className="max-h-96 min-h-[16rem] flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="pt-8 text-center text-sm text-zinc-500">
            No messages yet — say hi to the team! 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    mine
                      ? 'rounded-br-md bg-red-600 text-white'
                      : 'rounded-bl-md bg-zinc-800 text-zinc-100'
                  }`}
                >
                  {!mine && (
                    <p className="text-[11px] font-bold text-zinc-400">
                      {m.sender_name ?? 'Team member'}
                    </p>
                  )}
                  <p className="text-sm leading-snug">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      mine ? 'text-red-200' : 'text-zinc-500'
                    }`}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="border-t border-zinc-800 p-3"
      >
        {error && (
          <p role="alert" className="mb-2 text-xs text-red-400">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message the team…"
            maxLength={1000}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
          />
          <button
            type="submit"
            disabled={sending || draft.trim().length === 0}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
