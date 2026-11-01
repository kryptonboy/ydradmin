import type { CharacterForm } from '@/types/forms/CharacterForm'
import type { Character } from '@/types/models/Character'
import { createResourceStore } from './create-resource-store'

export const useCharactersStore = createResourceStore<Character, CharacterForm>(
  'characters',
  'characters',
)
