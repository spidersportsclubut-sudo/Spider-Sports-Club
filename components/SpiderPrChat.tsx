'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BOT_NAME,
  ESCALATION_EMAIL,
  GREETING,
  NO_MATCH_MESSAGE,
  QUICK_QUESTIONS,
} from '@/lib/bot/config'
import { matchFaq } from '@/lib/bot/match'
import { createClient } from '@/lib/supabase/client'

type ChatMessage = {
  role: 'bot' | 'user'
  text: string
}

type FormStatus = 'idle' | 'saving' | 'saved' | 'failed'

/**
 * Spider PR — v1 guided FAQ chat widget.
 *
 * Guided FAQ only: quick-question buttons plus keyword matching to the
 * approved answers in lib/bot/config. No AI-generated text. When nothing
 * matches, the widget says so plainly and captures the visitor's name,
 * contact, and question into the bot_messages table (see
 * supabase/migrations/0002_bot_messages.sql) for the club team to follow
 * up. If saving fails, it never claims the message was saved — it points
 * the visitor at the club email instead.
 */
export default function SpiderPrChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: GREETING },
  ])
  const [input, setInput] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formContact, setFormContact] = useState('')
  const [formQuestion, setFormQuestion] = useState('')
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, showForm, formStatus])

  function pushBot(text: string) {
    setMessages((prev) => [...prev, { role: 'bot', text }])
  }

  function askQuestion(question: string) {
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    const faq = matchFaq(question)
    if (faq) {
      pushBot(faq.answer)
    } else {
      pushBot(NO_MATCH_MESSAGE)
      setFormQuestion(question)
      setShowForm(true)
      setFormStatus('idle')
    }
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault()
    const name = formName.trim()
    const contact = formContact.trim()
    const question = formQuestion.trim()
    if (!name || !contact || !question) return
    setFormStatus('saving')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bot_messages')
        .insert({ name, contact, question })
      if (error) throw error
      setFormStatus('saved')
      setShowForm(false)
      pushBot(
        'Thanks — your message is saved for the club team. They will get back to you.',
      )
      setFormName('')
      setFormContact('')
      setFormQuestion('')
    } catch {
      setFormStatus('failed')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label={`${BOT_NAME} chat`}
          className="flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-sm font-bold text-white">{BOT_NAME}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <p
                key={index}
                className={
                  message.role === 'bot'
                    ? 'max-w-[90%] rounded-2xl rounded-tl-sm bg-zinc-800 px-3 py-2 text-sm leading-relaxed text-zinc-100'
                    : 'ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-red-600 px-3 py-2 text-sm leading-relaxed text-white'
                }
              >
                {message.text}
              </p>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((faq) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => askQuestion(faq.label)}
                    className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-red-600 hover:text-white"
                  >
                    {faq.label}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForm(true)
                setFormStatus('idle')
              }}
              className="text-xs font-medium text-zinc-400 underline hover:text-white"
            >
              Leave a message for the club team
            </button>

            {showForm && (
              <form
                onSubmit={submitForm}
                className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <p className="text-sm font-bold text-white">
                  Message the club team
                </p>
                <label className="block text-xs text-zinc-400">
                  Your name
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block text-xs text-zinc-400">
                  Email or phone
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(event) => setFormContact(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block text-xs text-zinc-400">
                  Your question
                  <textarea
                    required
                    rows={3}
                    value={formQuestion}
                    onChange={(event) => setFormQuestion(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </label>
                <button
                  type="submit"
                  disabled={formStatus === 'saving'}
                  className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {formStatus === 'saving' ? 'Sending…' : 'Send message'}
                </button>
                {formStatus === 'failed' && (
                  <p className="text-xs leading-relaxed text-zinc-300">
                    I couldn&apos;t save that just now — please email us
                    directly at{' '}
                    <a
                      href={`mailto:${ESCALATION_EMAIL}`}
                      className="font-medium text-white underline"
                    >
                      {ESCALATION_EMAIL}
                    </a>
                    .
                  </p>
                )}
              </form>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (input.trim()) askQuestion(input.trim())
            }}
            className="flex gap-2 border-t border-zinc-800 bg-zinc-950 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask something else…"
              aria-label="Ask Spider PR a question"
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : `Open ${BOT_NAME} chat`}
        className="rounded-full bg-red-600 px-5 py-3 text-sm font-extrabold text-white shadow-2xl hover:bg-red-500"
      >
        {BOT_NAME}
      </button>
    </div>
  )
}
