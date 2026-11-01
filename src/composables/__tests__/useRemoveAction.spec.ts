import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/helpers/api-error'
import { useRemoveAction } from '../useRemoveAction'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useRemoveAction', () => {
  it('ne supprime rien sans confirmation', async () => {
    vi.stubGlobal('confirm', () => false)
    const store = { remove: vi.fn() }
    const reload = vi.fn()
    const { remove } = useRemoveAction(store, reload)

    await remove({ id: 3 }, 'Tag')

    expect(store.remove).not.toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
  })

  it('supprime puis recharge la liste', async () => {
    vi.stubGlobal('confirm', () => true)
    const store = { remove: vi.fn().mockResolvedValue(undefined) }
    const reload = vi.fn()
    const { remove, removeError } = useRemoveAction(store, reload)

    await remove({ id: 3 }, 'Tag')

    expect(store.remove).toHaveBeenCalledWith(3)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(removeError.value).toBeNull()
  })

  it("expose tel quel le message d'un conflit (409) et ne recharge pas", async () => {
    vi.stubGlobal('confirm', () => true)
    const message = 'Impossible de supprimer ce tag : il est lié à 2 cartes abstraites.'
    const store = { remove: vi.fn().mockRejectedValue(new ApiError(message, 409)) }
    const reload = vi.fn()
    const { remove, removeError } = useRemoveAction(store, reload)

    await remove({ id: 3 }, 'Tag')

    expect(removeError.value).toBe(message)
    expect(reload).not.toHaveBeenCalled()
  })

  it("efface l'erreur précédente à la tentative suivante", async () => {
    vi.stubGlobal('confirm', () => true)
    const store = {
      remove: vi
        .fn()
        .mockRejectedValueOnce(new ApiError('Conflit', 409))
        .mockResolvedValueOnce(undefined),
    }
    const { remove, removeError } = useRemoveAction(store, vi.fn())

    await remove({ id: 1 }, 'A')
    expect(removeError.value).toBe('Conflit')
    await remove({ id: 1 }, 'A')
    expect(removeError.value).toBeNull()
  })
})
