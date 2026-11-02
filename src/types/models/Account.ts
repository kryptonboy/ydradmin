/** Compte utilisateur vu par l'administration (jamais de mot de passe en lecture). */
export interface Account {
  '@id': string
  id: number
  username: string
  email: string
  /** `ROLE_USER` est toujours présent */
  roles?: string[]
  commentsCount?: number
  /** Un compte banni ne peut plus se connecter */
  banned: boolean
  /** Faux : le compte (créé par l'inscription publique) ne peut pas se connecter */
  emailVerified: boolean
  /** Collection consultable par tous (réglée par le joueur lui-même) */
  collectionPublic: boolean
}
