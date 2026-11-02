import type { DeckForm } from '@/types/forms/DeckForm'
import type { Deck } from '@/types/models/Deck'
import { createResourceStore } from './create-resource-store'

export const useDecksStore = createResourceStore<Deck, DeckForm>('decks', 'decks')
