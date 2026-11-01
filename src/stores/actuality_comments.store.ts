import type { ActualityCommentForm } from '@/types/forms/ActualityCommentForm'
import type { ActualityComment } from '@/types/models/ActualityComment'
import { createResourceStore } from './create-resource-store'

export const useActualityCommentsStore = createResourceStore<
  ActualityComment,
  ActualityCommentForm
>('actuality_comments', 'actuality_comments')
