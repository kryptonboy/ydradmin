import type { EpisodeCharacterForm } from '@/types/forms/EpisodeCharacterForm'
import type { Appearance } from '@/types/models/Appearance'
import { createResourceStore } from './create-resource-store'

export const useEpisodeCharactersStore = createResourceStore<Appearance, EpisodeCharacterForm>(
  'episode_characters',
  'episode_characters',
)
