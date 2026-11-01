import { describe, expect, it } from 'vitest'
import { formatDateTime, fromDatetimeLocal, toDatetimeLocal } from '../date'

describe('datetime-local', () => {
  it('fait un aller-retour sans perte à la minute', () => {
    const iso = '2026-11-05T09:30:00.000Z'
    expect(fromDatetimeLocal(toDatetimeLocal(iso))).toBe(iso)
  })

  it('renvoie une valeur vide pour une date absente ou invalide', () => {
    expect(toDatetimeLocal(null)).toBe('')
    expect(toDatetimeLocal('pas une date')).toBe('')
    expect(fromDatetimeLocal('')).toBeNull()
    expect(fromDatetimeLocal('pas une date')).toBeNull()
  })

  it('formate au format attendu par le champ', () => {
    expect(toDatetimeLocal('2026-11-05T09:30:00')).toBe('2026-11-05T09:30')
  })
})

describe('formatDateTime', () => {
  it('renvoie une chaîne vide si la date est absente', () => {
    expect(formatDateTime(null)).toBe('')
    expect(formatDateTime(undefined)).toBe('')
  })
})
