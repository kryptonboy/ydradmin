import type { MangaForm } from '@/types/forms/MangaForm'
import type { Manga } from '@/types/models/Manga'
import { createResourceStore } from './create-resource-store'

export const useMangasStore = createResourceStore<Manga, MangaForm>('mangas', 'mangas')
