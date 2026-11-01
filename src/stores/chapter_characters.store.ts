import type { ChapterCharacterForm } from '@/types/forms/ChapterCharacterForm'
import type { Appearance } from '@/types/models/Appearance'
import { createResourceStore } from './create-resource-store'

export const useChapterCharactersStore = createResourceStore<Appearance, ChapterCharacterForm>(
  'chapter_characters',
  'chapter_characters',
)
