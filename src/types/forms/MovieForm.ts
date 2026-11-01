import type { Block } from '../content-blocks'
import type { MovieInput } from '../api-types'

// L'OpenAPI type `blocks` comme une liste d'objets génériques
export type MovieForm = Omit<MovieInput, 'blocks'> & { blocks?: Block[] }
