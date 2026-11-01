import type { GenderForm } from '@/types/forms/GenderForm'
import type { Gender } from '@/types/models/Gender'
import { createResourceStore } from './create-resource-store'

export const useGendersStore = createResourceStore<Gender, GenderForm>('genders', 'genders')
