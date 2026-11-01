import type { VideoGameCharacterForm } from '@/types/forms/VideoGameCharacterForm'
import type { Appearance } from '@/types/models/Appearance'
import { createResourceStore } from './create-resource-store'

export const useVideoGameCharactersStore = createResourceStore<Appearance, VideoGameCharacterForm>(
  'video_game_characters',
  'video_game_characters',
)
