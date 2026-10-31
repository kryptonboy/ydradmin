import type { User } from '../User'

export interface AuthStateData {
  token: string | null
  user: User | null
  returnUrl: string | null
  isAuthChecked: boolean
  isChecking: boolean
}
