import type { ArcCharacterForm } from '@/types/forms/ArcCharacterForm'
import type { ArcCharacter } from '@/types/models/ArcCharacter'
import { createResourceStore } from './create-resource-store'

export const useArcCharactersStore = createResourceStore<ArcCharacter, ArcCharacterForm>(
  'arc_characters',
  'arc_characters',
)
