import type { RestrictionForm } from '@/types/forms/RestrictionForm'
import type { Restriction } from '@/types/models/Restriction'
import { createResourceStore } from './create-resource-store'

export const useRestrictionsStore = createResourceStore<Restriction, RestrictionForm>(
  'restrictions',
  'restrictions',
)
