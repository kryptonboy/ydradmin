import type { CardForm } from '@/types/forms/CardForm'
import type { Card } from '@/types/models/Card'
import { createResourceStore } from './create-resource-store'

export const useCardsStore = createResourceStore<Card, CardForm>('cards', 'cards')
