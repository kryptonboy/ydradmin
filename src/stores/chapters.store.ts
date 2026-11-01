import type { ChapterForm } from '@/types/forms/ChapterForm'
import type { Chapter } from '@/types/models/Chapter'
import { createResourceStore } from './create-resource-store'

export const useChaptersStore = createResourceStore<Chapter, ChapterForm>('chapters', 'chapters')
