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
