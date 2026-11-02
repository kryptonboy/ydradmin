import type { GradingCompanyForm } from '@/types/forms/GradingCompanyForm'
import type { GradingCompany } from '@/types/models/GradingCompany'
import { createResourceStore } from './create-resource-store'

export const useGradingCompaniesStore = createResourceStore<GradingCompany, GradingCompanyForm>(
  'grading_companies',
  'grading_companies',
)
