import type { CardPriceForm } from '@/types/forms/CardPriceForm'
import type { CardPrice, CardPriceHistory } from '@/types/models/CardPrice'
import { createResourceStore } from './create-resource-store'

export const useCardPricesStore = createResourceStore<CardPrice, CardPriceForm>(
  'card_prices',
  'card_prices',
)

/** Historique en lecture seule : l'API écrit un point à chaque création ou changement de montant */
export const useCardPriceHistoriesStore = createResourceStore<CardPriceHistory, never>(
  'card_price_histories',
  'card_price_histories',
)
