import { getErrorMessage } from '@/helpers/api-error'
import { ref } from 'vue'

/**
 * Suppression depuis une liste : confirmation, appel de l'API puis rechargement.
 * Quand l'API refuse (409 : l'élément est encore référencé), son message est exposé dans
 * `removeError`, à afficher tel quel.
 */
export function useRemoveAction(
  store: { remove(id: number): Promise<unknown> },
  reload: () => unknown,
) {
  const removeError = ref<string | null>(null)

  async function remove(item: { id: number }, label: string) {
    if (!window.confirm(`Supprimer « ${label} » ?`)) return
    removeError.value = null
    try {
      await store.remove(item.id)
      await reload()
    } catch (err) {
      removeError.value = getErrorMessage(err)
    }
  }

  return { removeError, remove }
}
