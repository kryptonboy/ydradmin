export interface User {
  id: number
  username: string
  avatar: string
  /** Rôles du compte (ROLE_USER toujours présent) */
  roles?: string[]
}
