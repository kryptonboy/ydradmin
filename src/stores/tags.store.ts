import type { TagForm } from '@/types/forms/TagForm'
import type { Tag } from '@/types/models/Tag'
import { createResourceStore } from './create-resource-store'

export const useTagsStore = createResourceStore<Tag, TagForm>('tags', 'tags')
