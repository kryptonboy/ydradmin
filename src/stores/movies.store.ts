import type { MovieForm } from '@/types/forms/MovieForm'
import type { Movie } from '@/types/models/Movie'
import { createResourceStore } from './create-resource-store'

export const useMoviesStore = createResourceStore<Movie, MovieForm>('movies', 'movies')
