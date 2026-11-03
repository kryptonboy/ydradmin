import type { TradeForm } from '@/types/forms/TradeForm'
import type { Trade } from '@/types/models/Trade'
import { createResourceStore } from './create-resource-store'

export const useTradesStore = createResourceStore<Trade, TradeForm>('trades', 'trades')
