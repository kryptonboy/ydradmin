import type { AstrologicalSignForm } from '@/types/forms/AstrologicalSignForm'
import type { AstrologicalSign } from '@/types/models/AstrologicalSign'
import { createResourceStore } from './create-resource-store'

export const useAstrologicalSignsStore = createResourceStore<
  AstrologicalSign,
  AstrologicalSignForm
>('astrological_signs', 'astrological_signs')
