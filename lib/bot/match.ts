import { FAQS, type Faq } from './config'

/**
 * Guided FAQ matching — keyword scoring only, no AI-generated text.
 * Normalizes the visitor's question, counts keyword hits per FAQ, and
 * returns the highest-scoring FAQ. Returns null when nothing matches, so
 * the widget can say plainly that it doesn't have that answer yet.
 */
export function matchFaq(question: string): Faq | null {
  const normalized = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return null

  let best: Faq | null = null
  let bestScore = 0
  for (const faq of FAQS) {
    let score = 0
    for (const keyword of faq.keywords) {
      if (normalized.includes(keyword)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = faq
    }
  }
  return best
}
