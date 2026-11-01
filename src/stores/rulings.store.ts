import type { RulingForm } from '@/types/forms/RulingForm'
import type { Ruling } from '@/types/models/Ruling'
import { createResourceStore } from './create-resource-store'

export const useRulingsStore = createResourceStore<Ruling, RulingForm>('rulings', 'rulings')
