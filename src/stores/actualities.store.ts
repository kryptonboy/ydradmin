import type { ActualityForm } from '@/types/forms/ActualityForm'
import type { Actuality } from '@/types/models/Actuality'
import { createResourceStore } from './create-resource-store'

export const useActualitiesStore = createResourceStore<Actuality, ActualityForm>(
  'actualities',
  'actualities',
)
