import type { Block } from '../content-blocks'
import type { EpisodeInput } from '../api-types'

// L'OpenAPI type `blocks` comme une liste d'objets génériques
export type EpisodeForm = Omit<EpisodeInput, 'blocks'> & { blocks?: Block[] }
