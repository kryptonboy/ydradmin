import type { MonsterAttributeForm } from '@/types/forms/MonsterAttributeForm'
import type { MonsterAttribute } from '@/types/models/MonsterAttribute'
import { createResourceStore } from './create-resource-store'

export const useMonsterAttributesStore = createResourceStore<
  MonsterAttribute,
  MonsterAttributeForm
>('monster_attributes', 'monster_attributes')
