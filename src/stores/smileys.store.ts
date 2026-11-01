import type { SmileyForm } from '@/types/forms/SmileyForm'
import type { Smiley } from '@/types/models/Smiley'
import { createResourceStore } from './create-resource-store'

export const useSmileysStore = createResourceStore<Smiley, SmileyForm>('smileys', 'smileys')
