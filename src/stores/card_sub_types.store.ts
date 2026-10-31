import type { CardSubTypeForm } from '@/types/forms/CardSubTypeForm'
import type { CardSubType } from '@/types/models/CardSubType'
import { createResourceStore } from './create-resource-store'

export const useCardSubTypesStore = createResourceStore<CardSubType, CardSubTypeForm>(
  'card_sub_types',
  'card_sub_types',
)
