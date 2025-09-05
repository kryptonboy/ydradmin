export interface AuthState {
  token: string | null
  logout: () => void
}
