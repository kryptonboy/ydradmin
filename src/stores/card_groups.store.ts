import type { CardGroupForm } from '@/types/forms/CardGroupForm'
import type { CardGroup } from '@/types/models/CardGroup'
import { createResourceStore } from './create-resource-store'

export const useCardGroupsStore = createResourceStore<CardGroup, CardGroupForm>(
  'card_groups',
  'card_groups',
)
