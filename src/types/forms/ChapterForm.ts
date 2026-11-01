import type { Block } from '../content-blocks'
import type { ChapterInput } from '../api-types'

// L'OpenAPI type `blocks` comme une liste d'objets génériques
export type ChapterForm = Omit<ChapterInput, 'blocks'> & { blocks?: Block[] }
