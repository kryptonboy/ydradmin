import type { Country } from '../models/Country'
import type { ExtensionType } from '../models/ExtensionType'

export interface ExtensionForm {
  name: string
  reference: string
  releaseDate?: Date
  cardsCount: number
  extensionType: string
  country: string
}
