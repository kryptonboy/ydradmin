import type { Block } from '../content-blocks'
import type { ActualityInput } from '../api-types'

// L'OpenAPI type `blocks` comme une liste d'objets génériques
export type ActualityForm = Omit<ActualityInput, 'blocks'> & { blocks?: Block[] }
