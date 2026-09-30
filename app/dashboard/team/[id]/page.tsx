import { redirect } from 'next/navigation'
import {
  getCurrentUserId,
  getMyTeams,
  getProfile,
  getSupabase,
  isStaffForTeam,
} from '../../data'
import { SetupNotice } from '@/components/dashboard/SetupNotice'
import { CalendarGrid } from '@/components/dashboard/CalendarGrid'
import { EventRsvp, type RsvpPlayer } from '@/components/dashboard/RsvpButtons'
import { TeamChat } from '@/components/dashboard/TeamChat'
import { RosterList, type RosterPlayer } from '@/components/dashboard/RosterList'
import { CreateEventForm } from '@/components/dashboard/CreateEventForm'
import type { ClubEvent, Player, Rsvp, RsvpStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await getSupabase()
  if (!supabase) return <SetupNotice />

  const userId = await getCurrentUserId(supabase)
  if (!userId) redirect('/login')

  const profile = await getProfile(supabase, userId)
  if (!profile) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
        <h2 className="text-xl font-bold text-zinc-100">
          Profile not set up yet
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Ask your coach to set up your profile before using the team
          dashboard.
        </p>
      </div>
    )
  }

  const myTeams = await getMyTeams(supabase, userId, profile)
  const team = myTeams.find((t) => t.id === id)
  if (!team) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
        <h2 className="text-xl font-bold text-zinc-100">
          You don&apos;t have access to this team.
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          If you should be on this roster, ask your coach or club admin to add
          you.
        </p>
      </div>
    )
  }

  const staff = isStaffForTeam(profile, userId, team)

  // Roster: players with joined profile names.
  const { data: playerRows } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', id)
    .order('jersey_number', { ascending: true, nullsFirst: false })
  const players = (playerRows as Player[]) ?? []
  const rosterProfileIds = [
    ...new Set(players.map((p) => p.profile_id).filter(Boolean)),
  ] as string[]
  const rosterNames: Record<string, string> = {}
  if (rosterProfileIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', rosterProfileIds)
    for (const p of (profs ?? []) as {
      id: string
      full_name: string | null
    }[]) {
      rosterNames[p.id] = p.full_name ?? '—'
    }
  }
  const roster: RosterPlayer[] = players.map((p) => ({
    id: p.id,
    jersey_number: p.jersey_number,
    position: p.position,
    evaluation_score: p.evaluation_score,
    name: p.profile_id ? (rosterNames[p.profile_id] ?? null) : null,
  }))

  // Schedule
  const { data: eventRows } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', id)
    .order('starts_at', { ascending: true })
  const events = (eventRows as ClubEvent[]) ?? []
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.starts_at) >= now)
  const pastEvents = events
    .filter((e) => new Date(e.starts_at) < now)
    .reverse()
    .slice(0, 5)

  // The viewer's player rows on this roster (for RSVP).
  const myPlayerRows = players.filter((p) => p.profile_id === userId)
  const rsvpPlayers: RsvpPlayer[] = myPlayerRows.map((p) => ({
    id: p.id,
    label:
      rosterNames[p.profile_id as string] ??
      (p.jersey_number ? `#${p.jersey_number}` : 'My player'),
  }))
  const initialStatuses: Record<string, RsvpStatus | null> = {}
  for (const p of myPlayerRows) initialStatuses[p.id] = null
  if (myPlayerRows.length > 0) {
    const { data: rsvpRows } = await supabase
      .from('rsvps')
      .select('player_id, status')
      .in(
        'player_id',
        myPlayerRows.map((p) => p.id)
      )
      .in(
        'event_id',
        upcomingEvents.map((e) => e.id)
      )
    for (const r of (rsvpRows as Pick<Rsvp, 'player_id' | 'status'>[]) ?? []) {
      initialStatuses[r.player_id] = r.status
    }
  }

  return (
    <div className="space-y-10">
      {/* Team header */}
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">
            {team.name}
          </h1>
          {staff && (
            <span className="rounded-full border border-red-600/40 bg-red-600/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
              {profile.role === 'admin' ? 'Admin' : 'Coach'}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          {team.division} · {team.city} · {players.length}/
          {team.max_players} players
        </p>
      </header>

      {/* Roster */}
      <Section title={`Roster (${players.length})`}>
        <RosterList players={roster} viewerIsStaff={staff} />
        {staff && (
          <p className="mt-2 text-xs text-zinc-600">
            Evaluation scores are only visible to coaches and admins.
          </p>
        )}
      </Section>

      {/* Schedule */}
      <Section title="Schedule">
        <CalendarGrid events={events} />

        <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-zinc-500">
          Upcoming events
        </h3>
        {upcomingEvents.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
            No upcoming events scheduled.
          </div>
        ) : (
          <ul className="space-y-4">
            {upcomingEvents.map((e) => (
              <li
                key={e.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
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
                  <span className="text-sm font-bold text-zinc-100">
                    {formatWhen(e.starts_at)}
                  </span>
                  {e.location && (
                    <span className="text-sm text-zinc-400">
                      📍 {e.location}
                    </span>
                  )}
                </div>
                {e.notes && (
                  <p className="mt-1 text-sm text-zinc-500">{e.notes}</p>
                )}
                <EventRsvp
                  eventId={e.id}
                  players={rsvpPlayers}
                  initialStatuses={initialStatuses}
                />
              </li>
            ))}
          </ul>
        )}

        {pastEvents.length > 0 && (
          <>
            <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Recent past events
            </h3>
            <ul className="space-y-2">
              {pastEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-500"
                >
                  <span className="font-bold uppercase text-zinc-600">
                    {e.type}
                  </span>
                  <span>{formatWhen(e.starts_at)}</span>
                  {e.location && <span>· {e.location}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      {/* Coach/admin: create events */}
      {staff && (
        <Section title="Create event">
          <CreateEventForm teamId={id} />
        </Section>
      )}

      {/* Team chat */}
      <Section title="Team chat">
        <TeamChat
          teamId={id}
          currentUserId={userId}
          currentUserName={profile.full_name ?? 'Team member'}
        />
      </Section>
    </div>
  )
}
