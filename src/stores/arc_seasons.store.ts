import type { ArcSeasonForm } from '@/types/forms/ArcSeasonForm'
import type { ArcSeason } from '@/types/models/ArcSeason'
import { createResourceStore } from './create-resource-store'

export const useArcSeasonsStore = createResourceStore<ArcSeason, ArcSeasonForm>(
  'arc_seasons',
  'arc_seasons',
)
