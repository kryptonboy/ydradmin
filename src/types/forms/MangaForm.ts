import type { Block } from '../content-blocks'
import type { MangaInput } from '../api-types'

// L'OpenAPI type `blocks` comme une liste d'objets génériques
export type MangaForm = Omit<MangaInput, 'blocks'> & { blocks?: Block[] }
