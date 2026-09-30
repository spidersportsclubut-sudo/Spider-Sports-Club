import type { SupabaseClient } from '@supabase/supabase-js'
import type { Profile, Team } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

/**
 * Shared server-side data helpers for the dashboard.
 * Every helper tolerates a missing Supabase config: getSupabase() returns
 * null instead of throwing, and pages render a friendly notice in that case.
 */

/** Server Supabase client, or null when env vars are missing. */
export async function getSupabase(): Promise<SupabaseClient | null> {
  try {
    return await createClient()
  } catch {
    return null
  }
}

export async function getCurrentUserId(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return (data as Profile | null) ?? null
}

/**
 * Resolve the teams a user belongs to:
 * - admin → every team
 * - coach → teams they coach
 * - parent/player → teams with a players row linked to their profile
 */
export async function getMyTeams(
  supabase: SupabaseClient,
  userId: string,
  profile: Profile
): Promise<Team[]> {
  if (profile.role === 'admin') {
    const { data } = await supabase.from('teams').select('*').order('name')
    return (data as Team[]) ?? []
  }
  if (profile.role === 'coach') {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('coach_id', userId)
      .order('name')
    return (data as Team[]) ?? []
  }
  const { data: rows } = await supabase
    .from('players')
    .select('team_id')
    .eq('profile_id', userId)
  const teamIds = [
    ...new Set((rows ?? []).map((r) => r.team_id).filter(Boolean)),
  ] as string[]
  if (teamIds.length === 0) return []
  const { data } = await supabase
    .from('teams')
    .select('*')
    .in('id', teamIds)
    .order('name')
  return (data as Team[]) ?? []
}

/** A user counts as staff for a team when they're an admin or that team's coach. */
export function isStaffForTeam(
  profile: Profile,
  userId: string,
  team: Team
): boolean {
  return profile.role === 'admin' || team.coach_id === userId
}
