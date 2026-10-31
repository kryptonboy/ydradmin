import type { CardTypeForm } from '@/types/forms/CardTypeForm'
import type { CardType } from '@/types/models/CardType'
import { createResourceStore } from './create-resource-store'

export const useCardTypesStore = createResourceStore<CardType, CardTypeForm>(
  'card_types',
  'card_types',
)
