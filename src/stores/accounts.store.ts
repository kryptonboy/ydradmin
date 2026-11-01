import type { AccountForm } from '@/types/forms/AccountForm'
import type { Account } from '@/types/models/Account'
import { createResourceStore } from './create-resource-store'

export const useAccountsStore = createResourceStore<Account, AccountForm>('accounts', 'users')
