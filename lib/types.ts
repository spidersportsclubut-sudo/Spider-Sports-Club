/** Shared TypeScript types mirroring the Supabase schema (supabase/migrations). */

export type Role = 'admin' | 'coach' | 'parent' | 'player'

export interface Profile {
  id: string
  role: Role
  full_name: string | null
  created_at: string
}

export interface Team {
  id: string
  name: string
  division: string
  city: string
  coach_id: string | null
  max_players: number
  created_at: string
}

export interface Player {
  id: string
  profile_id: string | null
  team_id: string
  jersey_number: number | null
  position: string | null
  /** SSC evaluation score, 0–15. A player needs 15 to keep their roster spot. */
  evaluation_score: number | null
  created_at: string
}

export type EventType = 'practice' | 'game'

export interface ClubEvent {
  id: string
  team_id: string
  type: EventType
  starts_at: string
  ends_at: string | null
  location: string | null
  notes: string | null
  created_at: string
}

export type RsvpStatus = 'going' | 'maybe' | 'out'

export interface Rsvp {
  id: string
  event_id: string
  player_id: string
  status: RsvpStatus
  created_at: string
}

export type RegistrationStatus = 'pending' | 'paid' | 'cancelled'

export interface Registration {
  id: string
  player_name: string
  division: string
  team_id: string | null
  parent_name: string | null
  parent_email: string
  parent_phone: string | null
  agreement_accepted: boolean
  status: RegistrationStatus
  stripe_session_id: string | null
  created_at: string
}

export interface Payment {
  id: string
  registration_id: string
  amount_cents: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  team_id: string
  sender_id: string | null
  body: string
  created_at: string
  /** Joined sender name when available. */
  sender_name?: string | null
}
