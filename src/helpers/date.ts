const pad = (n: number) => String(n).padStart(2, '0')

/** ISO 8601 de l'API → valeur d'un `<input type="datetime-local">` (heure locale). */
export function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Valeur d'un `<input type="datetime-local">` → ISO 8601 (UTC), ou null si vide. */
export function fromDatetimeLocal(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fr-FR')
}

/** ISO 8601 de l'API → valeur d'un `<input type="date">` (jour calendaire, sans décalage de fuseau). */
export function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : ''
}

/** Valeur d'un `<input type="date">` → ISO 8601 à minuit UTC, ou null si vide. */
export function fromDateInput(value: string | null | undefined): string | null {
  return value ? `${value}T00:00:00+00:00` : null
}

/** Jour calendaire (UTC) en français, ex. `05/11/2026`. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR', { timeZone: 'UTC' })
}
