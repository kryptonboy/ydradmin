import type { MangaCharacterForm } from '@/types/forms/MangaCharacterForm'
import type { MangaCharacter } from '@/types/models/MangaCharacter'
import { createResourceStore } from './create-resource-store'

export const useMangaCharactersStore = createResourceStore<MangaCharacter, MangaCharacterForm>(
  'manga_characters',
  'manga_characters',
)
