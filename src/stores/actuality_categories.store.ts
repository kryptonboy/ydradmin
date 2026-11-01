import type { ActualityCategoryForm } from '@/types/forms/ActualityCategoryForm'
import type { ActualityCategory } from '@/types/models/ActualityCategory'
import { createResourceStore } from './create-resource-store'

export const useActualityCategoriesStore = createResourceStore<
  ActualityCategory,
  ActualityCategoryForm
>('actuality_categories', 'actuality_categories')
