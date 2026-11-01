import type { EpisodeForm } from '@/types/forms/EpisodeForm'
import type { Episode } from '@/types/models/Episode'
import { createResourceStore } from './create-resource-store'

export const useEpisodesStore = createResourceStore<Episode, EpisodeForm>('episodes', 'episodes')
