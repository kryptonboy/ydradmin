import type { SeasonForm } from '@/types/forms/SeasonForm'
import type { Season } from '@/types/models/Season'
import { createResourceStore } from './create-resource-store'

export const useSeasonsStore = createResourceStore<Season, SeasonForm>('seasons', 'seasons')
