import type { MovieCharacterForm } from '@/types/forms/MovieCharacterForm'
import type { Appearance } from '@/types/models/Appearance'
import { createResourceStore } from './create-resource-store'

export const useMovieCharactersStore = createResourceStore<Appearance, MovieCharacterForm>(
  'movie_characters',
  'movie_characters',
)
