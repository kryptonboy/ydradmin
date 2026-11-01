/** URL absolue d'un média : l'API renvoie un chemin relatif à son domaine (ex. `/images/x.jpg`). */
export function mediaUrl(contentUrl: string | null | undefined): string | null {
  if (!contentUrl) return null
  if (/^https?:\/\//.test(contentUrl)) return contentUrl
  try {
    return new URL(contentUrl, new URL(import.meta.env.VITE_API_URL).origin).toString()
  } catch {
    return contentUrl
  }
}
