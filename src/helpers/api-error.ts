/** Erreur renvoyée par l'API (API Platform / Symfony). */
export class ApiError extends Error {
  readonly status: number
  /** Violations de validation (HTTP 422) indexées par nom de champ */
  readonly violations: Record<string, string>

  constructor(message: string, status: number, violations: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.violations = violations
  }
}

interface ApiErrorBody {
  message?: string
  detail?: string
  description?: string
  title?: string
  violations?: { propertyPath?: string; message?: string }[]
  [key: string]: unknown
}

export function createApiError(body: unknown, status: number, statusText: string): ApiError {
  const data = (body && typeof body === 'object' ? body : {}) as ApiErrorBody

  const violations: Record<string, string> = {}
  for (const { propertyPath, message } of data.violations ?? []) {
    if (propertyPath && message && !(propertyPath in violations)) {
      violations[propertyPath] = message
    }
  }

  const message =
    data.detail ||
    data.message ||
    (typeof data['hydra:description'] === 'string' ? data['hydra:description'] : '') ||
    data.description ||
    (typeof data.error === 'string' ? data.error : '') ||
    data.title ||
    statusText ||
    `Erreur ${status}`

  return new ApiError(message, status, violations)
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string' && err) return err
  return 'Erreur inconnue'
}
