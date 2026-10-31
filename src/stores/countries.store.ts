import type { CountryForm } from '@/types/forms/CountryForm'
import type { Country } from '@/types/models/Country'
import { createResourceStore } from './create-resource-store'

export const useCountriesStore = createResourceStore<Country, CountryForm>('countries', 'countries')
