import type { AnimeForm } from '@/types/forms/AnimeForm'
import type { Anime } from '@/types/models/Anime'
import { createResourceStore } from './create-resource-store'

export const useAnimesStore = createResourceStore<Anime, AnimeForm>('animes', 'animes')
