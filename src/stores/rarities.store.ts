import type { RarityForm } from '@/types/forms/RarityForm'
import type { Rarity } from '@/types/models/Rarity'
import { createResourceStore } from './create-resource-store'

export const useRaritiesStore = createResourceStore<Rarity, RarityForm>('rarities', 'rarities')
