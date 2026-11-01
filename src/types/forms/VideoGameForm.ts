import type { Block } from '../content-blocks'
import type { VideoGameInput } from '../api-types'

// L'OpenAPI type `blocks` comme une liste d'objets génériques
export type VideoGameForm = Omit<VideoGameInput, 'blocks'> & { blocks?: Block[] }
