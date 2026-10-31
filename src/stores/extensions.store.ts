import type { ExtensionForm } from '@/types/forms/ExtensionForm'
import type { Extension } from '@/types/models/Extension'
import { createResourceStore } from './create-resource-store'

export const useExtensionsStore = createResourceStore<Extension, ExtensionForm>(
  'extensions',
  'extensions',
)
