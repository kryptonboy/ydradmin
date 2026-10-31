import { ref } from 'vue'
import { ApiError, getErrorMessage } from '@/helpers/api-error'

/**
 * Exécute l'enregistrement d'un formulaire et expose l'erreur éventuelle.
 * Renvoie `true` si l'action a réussi ; sinon l'erreur est affichée (et les
 * violations de validation de l'API sont rattachées aux champs concernés).
 */
export function useSubmit() {
  const submitError = ref<string | null>(null)

  async function submit(
    action: () => Promise<unknown>,
    setErrors?: (errors: Record<string, string>) => void,
  ): Promise<boolean> {
    submitError.value = null
    try {
      await action()
      return true
    } catch (err) {
      submitError.value = getErrorMessage(err)
      if (err instanceof ApiError && setErrors) {
        setErrors(err.violations)
      }
      return false
    }
  }

  return { submitError, submit }
}
