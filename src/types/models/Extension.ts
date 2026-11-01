import type { MediaLink } from './Ref'
import type { Country } from './Country'
import type { ExtensionType } from './ExtensionType'

export interface Extension {
  '@id': string
  id: number
  name: string
  reference: string
  releaseDate?: string | null
  icon?: MediaLink | null
  cardsCount: number
  extensionType: ExtensionType
  country: Country
}
