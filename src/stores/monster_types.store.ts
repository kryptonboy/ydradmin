import type { MonsterTypeForm } from '@/types/forms/MonsterTypeForm'
import type { MonsterType } from '@/types/models/MonsterType'
import { createResourceStore } from './create-resource-store'

export const useMonsterTypesStore = createResourceStore<MonsterType, MonsterTypeForm>(
  'monster_types',
  'monster_types',
)
