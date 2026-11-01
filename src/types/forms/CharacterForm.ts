import type { Block } from '../content-blocks'
import type { CharacterInput } from '../api-types'

// L'OpenAPI type `blocks` comme une liste d'objets génériques
export type CharacterForm = Omit<CharacterInput, 'blocks'> & { blocks?: Block[] }
