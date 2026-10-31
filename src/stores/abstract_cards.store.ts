import type { AbstractCardForm } from '@/types/forms/AbstractCardForm'
import type { AbstractCard } from '@/types/models/AbstractCard'
import { createResourceStore } from './create-resource-store'

export const useAbstractCardsStore = createResourceStore<AbstractCard, AbstractCardForm>(
  'abstract_cards',
  'abstract_cards',
)
