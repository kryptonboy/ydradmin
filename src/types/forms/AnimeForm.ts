import type { Block } from '../content-blocks'
import type { AnimeInput } from '../api-types'

// L'OpenAPI type `blocks` comme une liste d'objets génériques
export type AnimeForm = Omit<AnimeInput, 'blocks'> & { blocks?: Block[] }
