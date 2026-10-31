import type { ExtensionTypeForm } from '@/types/forms/ExtensionTypeForm'
import type { ExtensionType } from '@/types/models/ExtensionType'
import { createResourceStore } from './create-resource-store'

export const useExtensionTypesStore = createResourceStore<ExtensionType, ExtensionTypeForm>(
  'extension_types',
  'extension_types',
)
