<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { getErrorMessage } from '@/helpers/api-error'
import { useListView } from '@/composables/useListView'
import { useRemoveAction } from '@/composables/useRemoveAction'
import { useAccountsStore, useAuthStore } from '@/stores'
import type { Account } from '@/types/models/Account'
import { ref } from 'vue'
import AccountModal from './modals/AccountModal.vue'
import ImpersonationModal from './modals/ImpersonationModal.vue'

const modalRef = ref<InstanceType<typeof AccountModal> | null>(null)
const selected = ref<Account | null>(null)
const impersonationRef = ref<InstanceType<typeof ImpersonationModal> | null>(null)
const impersonated = ref<Account | null>(null)
const store = useAccountsStore()
const auth = useAuthStore()

const {
  items,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(store, {
  sort: { sortBy: 'id', sortDir: 'asc' },
  createFilters: () => ({
    username: null as string | null,
    email: null as string | null,
    banned: null as string | null,
    emailVerified: null as string | null,
  }),
})

const banError = ref<string | null>(null)
const { removeError, remove } = useRemoveAction(store, reload)

const isAdmin = (account: Account) => !!account.roles?.includes('ROLE_ADMIN')
const isMediator = (account: Account) => !!account.roles?.includes('ROLE_MEDIATOR')
const roleLabel = (account: Account) =>
  isAdmin(account) ? 'Administrateur' : isMediator(account) ? 'Médiateur' : 'Utilisateur'
// L'API refuse qu'un administrateur supprime son propre compte
const isSelf = (account: Account) => account.id === auth.user?.id

/** Bannit (après confirmation) ou rétablit un compte sans ouvrir la modale */
async function toggleBan(account: Account) {
  if (!account.banned && !window.confirm(`Bannir « ${account.username} » ?`)) return
  banError.value = null
  try {
    await store.update(account.id, { banned: !account.banned })
    await reload()
  } catch (err) {
    banError.value = getErrorMessage(err)
  }
}

// L'API refuse l'impersonation de soi-même, d'un administrateur, d'un compte banni ou non confirmé
const canImpersonate = (account: Account) =>
  !isSelf(account) && !isAdmin(account) && !account.banned && account.emailVerified

function openImpersonation(account: Account) {
  impersonated.value = account
  impersonationRef.value?.showModal()
}

function openModal(account: Account | null = null) {
  selected.value = account
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Utilisateurs</h2>
    <div>
      <button
        class="btn btn-secondary me-md-2 position-relative"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#filterCollapse"
      >
        <font-awesome-icon :icon="['fa', 'filter']" />
        Filtrer
        <span
          v-if="nbFilters > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        >
          {{ nbFilters }}
        </span>
      </button>
      <button class="btn btn-primary" @click="openModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="account_username" class="form-label">Nom d'utilisateur</label>
        <input
          type="text"
          class="form-control"
          id="account_username"
          placeholder="Filtrer par nom..."
          v-model="filters.username"
        />
      </div>
      <div class="col-3">
        <label for="account_email" class="form-label">Email</label>
        <input
          type="text"
          class="form-control"
          id="account_email"
          placeholder="Filtrer par email..."
          v-model="filters.email"
        />
      </div>
      <div class="col-3">
        <label for="account_banned" class="form-label">Statut</label>
        <select class="form-select" id="account_banned" v-model="filters.banned">
          <option :value="null">Tous</option>
          <option value="false">Actifs</option>
          <option value="true">Bannis</option>
        </select>
      </div>
      <div class="col-3">
        <label for="account_emailVerified" class="form-label">E-mail</label>
        <select class="form-select" id="account_emailVerified" v-model="filters.emailVerified">
          <option :value="null">Tous</option>
          <option value="true">Confirmés</option>
          <option value="false">En attente</option>
        </select>
      </div>
      <div class="col-3 ms-auto d-flex flex-column gap-2">
        <button class="btn btn-secondary w-100" @click="resetFilters">
          <font-awesome-icon :icon="['fa', 'clock-rotate-left']" />
          Réinitialiser
        </button>
        <button class="btn btn-primary w-100" @click="applyFilters">
          <font-awesome-icon :icon="['fa', 'check']" />
          Appliquer
        </button>
      </div>
    </div>
  </div>
  <div v-if="removeError || banError" class="alert alert-danger" role="alert">
    {{ removeError ?? banError }}
  </div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="username" :sort="sort" @sort="setSort">
          Nom d'utilisateur
        </SortableHeader>
        <SortableHeader field="email" :sort="sort" @sort="setSort">Email</SortableHeader>
        <th scope="col">Rôle</th>
        <th scope="col">Commentaires</th>
        <th scope="col">Collection</th>
        <th scope="col">E-mail</th>
        <th scope="col">Statut</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="9" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="items.length">
      <tr v-for="account in items" :key="account.id">
        <td>{{ account.id }}</td>
        <td>{{ account.username }}</td>
        <td>{{ account.email }}</td>
        <td>
          <span
            class="badge"
            :class="
              isAdmin(account)
                ? 'bg-danger'
                : isMediator(account)
                  ? 'bg-warning text-dark'
                  : 'bg-secondary'
            "
          >
            {{ roleLabel(account) }}
          </span>
        </td>
        <td>{{ account.commentsCount ?? 0 }}</td>
        <td>
          <span class="badge" :class="account.collectionPublic ? 'bg-info' : 'bg-secondary'">
            {{ account.collectionPublic ? 'Publique' : 'Privée' }}
          </span>
        </td>
        <td>
          <span
            class="badge"
            :class="account.emailVerified ? 'bg-success' : 'bg-warning text-dark'"
          >
            {{ account.emailVerified ? 'Confirmé' : 'En attente' }}
          </span>
        </td>
        <td>
          <span class="badge" :class="account.banned ? 'bg-danger' : 'bg-success'">
            {{ account.banned ? 'Banni' : 'Actif' }}
          </span>
        </td>
        <td class="text-nowrap">
          <button class="btn btn-primary" aria-label="Modifier" @click="openModal(account)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <button
            v-if="canImpersonate(account)"
            class="btn btn-outline-secondary ms-1"
            aria-label="Se connecter en tant que"
            title="Se connecter en tant que"
            @click="openImpersonation(account)"
          >
            <font-awesome-icon :icon="['fa', 'key']" />
          </button>
          <button
            v-if="!isSelf(account)"
            class="btn btn-outline-secondary ms-1"
            :aria-label="account.banned ? 'Rétablir' : 'Bannir'"
            :title="account.banned ? 'Rétablir' : 'Bannir'"
            @click="toggleBan(account)"
          >
            <font-awesome-icon :icon="['fa', account.banned ? 'check' : 'ban']" />
          </button>
          <button
            v-if="!isSelf(account)"
            class="btn btn-outline-danger ms-1"
            aria-label="Supprimer"
            title="Supprimer"
            @click="remove(account, account.username)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="9">
          <em>Aucun utilisateur</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="9" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <ImpersonationModal ref="impersonationRef" :account="impersonated" />
  <AccountModal ref="modalRef" :account="selected ?? undefined" @saved="reload" />
</template>
