import type { MonsterEffectForm } from '@/types/forms/MonsterEffectForm'
import type { MonsterEffect } from '@/types/models/MonsterEffect'
import { createResourceStore } from './create-resource-store'

export const useMonsterEffectsStore = createResourceStore<MonsterEffect, MonsterEffectForm>(
  'monster_effects',
  'monster_effects',
)
