import type { ArcForm } from '@/types/forms/ArcForm'
import type { Arc } from '@/types/models/Arc'
import { createResourceStore } from './create-resource-store'

export const useArcsStore = createResourceStore<Arc, ArcForm>('arcs', 'arcs')
