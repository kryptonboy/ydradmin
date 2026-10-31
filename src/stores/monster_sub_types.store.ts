import type { MonsterSubTypeForm } from '@/types/forms/MonsterSubTypeForm'
import type { MonsterSubType } from '@/types/models/MonsterSubType'
import { createResourceStore } from './create-resource-store'

export const useMonsterSubTypesStore = createResourceStore<MonsterSubType, MonsterSubTypeForm>(
  'monster_sub_types',
  'monster_sub_types',
)
