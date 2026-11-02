<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useRemoveAction } from '@/composables/useRemoveAction'
import { createFetchWrapper } from '@/helpers'
import { getErrorMessage } from '@/helpers/api-error'
import { formatDateTime } from '@/helpers/date'
import { useAuthStore, useDecksStore, useGameFormatsStore } from '@/stores'
import type { Deck, DeckSection } from '@/types/models/Deck'
import { SECTION_LABELS } from '@/types/models/Deck'
import type { GameFormat } from '@/types/models/GameFormat'
import { onMounted, ref } from 'vue'

const store = useDecksStore()
const gameFormats = ref<GameFormat[]>([])
const actionError = ref<string | null>(null)

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
  sort: { sortBy: 'updatedAt', sortDir: 'desc' },
  createFilters: () => ({
    name: null as string | null,
    author: null as string | null,
    gameFormat: null as number | null,
    public: null as string | null,
    hidden: null as string | null,
  }),
})

const { removeError, remove } = useRemoveAction(store, reload)

onMounted(async () => {
  gameFormats.value = await useGameFormatsStore().fetchAll()
})

/** Nombre de cartes (quantités cumulées) d'une section */
function countIn(deck: Deck, section: DeckSection): number {
  return (deck.cards ?? [])
    .filter((card) => card.section === section)
    .reduce((total, card) => total + card.quantity, 0)
}

const sectionsSummary = (deck: Deck) =>
  (Object.keys(SECTION_LABELS) as DeckSection[])
    .map((section) => `${SECTION_LABELS[section]} ${countIn(deck, section)}`)
    .join(' · ')

/** Masque ou ré-affiche un deck (seule la modération peut changer `hidden`) */
async function toggleHidden(deck: Deck) {
  actionError.value = null
  try {
    await store.update(deck.id, { hidden: !deck.hidden })
    await reload()
  } catch (err) {
    actionError.value = getErrorMessage(err)
  }
}

/** Ouvre la feuille de tournoi PDF du deck (téléchargée avec le jeton, un lien direct ne passerait pas) */
async function openSheet(deck: Deck) {
  actionError.value = null
  try {
    const blob = await createFetchWrapper(useAuthStore()).getBlob(
      `${import.meta.env.VITE_API_URL}/decks/${deck.id}/sheet`,
    )
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (err) {
    actionError.value = getErrorMessage(err)
  }
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Decks</h2>
    <div>
      <button
        class="btn btn-secondary position-relative"
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
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row g-2">
      <div class="col-3">
        <label for="deck_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          id="deck_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="deck_author" class="form-label">Auteur</label>
        <input
          type="text"
          class="form-control"
          id="deck_author"
          placeholder="Filtrer par pseudo..."
          v-model="filters.author"
        />
      </div>
      <div class="col-3">
        <label for="deck_format" class="form-label">Format</label>
        <select class="form-select" id="deck_format" v-model="filters.gameFormat">
          <option :value="null">Tous</option>
          <option v-for="format in gameFormats" :key="format.id" :value="format.id">
            {{ format.name }}
          </option>
        </select>
      </div>
      <div class="col-3 d-flex flex-column gap-2">
        <button class="btn btn-secondary w-100" @click="resetFilters">
          <font-awesome-icon :icon="['fa', 'clock-rotate-left']" />
          Réinitialiser
        </button>
        <button class="btn btn-primary w-100" @click="applyFilters">
          <font-awesome-icon :icon="['fa', 'check']" />
          Appliquer
        </button>
      </div>
      <div class="col-3">
        <label for="deck_public" class="form-label">Publication</label>
        <select class="form-select" id="deck_public" v-model="filters.public">
          <option :value="null">Tous</option>
          <option value="true">Publics</option>
          <option value="false">Privés</option>
        </select>
      </div>
      <div class="col-3">
        <label for="deck_hidden" class="form-label">Modération</label>
        <select class="form-select" id="deck_hidden" v-model="filters.hidden">
          <option :value="null">Tous</option>
          <option value="false">Visibles</option>
          <option value="true">Masqués</option>
        </select>
      </div>
    </div>
  </div>
  <div v-if="removeError || actionError" class="alert alert-danger" role="alert">
    {{ removeError ?? actionError }}
  </div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="name" :sort="sort" @sort="setSort">Nom</SortableHeader>
        <th scope="col">Auteur</th>
        <th scope="col">Format</th>
        <th scope="col">Cartes</th>
        <th scope="col">Publication</th>
        <th scope="col">Statut</th>
        <SortableHeader field="updatedAt" :sort="sort" @sort="setSort">Modifié le</SortableHeader>
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
      <tr v-for="deck in items" :key="deck.id" :class="{ 'table-secondary': deck.hidden }">
        <td>{{ deck.id }}</td>
        <td>{{ deck.name }}</td>
        <td>{{ deck.author }}</td>
        <td>{{ deck.gameFormat?.name ?? '—' }}</td>
        <td class="text-nowrap small">{{ sectionsSummary(deck) }}</td>
        <td>
          <span class="badge" :class="deck.public ? 'bg-info' : 'bg-secondary'">
            {{ deck.public ? 'Public' : 'Privé' }}
          </span>
        </td>
        <td>
          <span class="badge" :class="deck.hidden ? 'bg-danger' : 'bg-success'">
            {{ deck.hidden ? 'Masqué' : 'Visible' }}
          </span>
        </td>
        <td>{{ formatDateTime(deck.updatedAt) }}</td>
        <td class="text-nowrap">
          <button
            class="btn btn-outline-secondary"
            :aria-label="deck.hidden ? 'Ré-afficher' : 'Masquer'"
            :title="deck.hidden ? 'Ré-afficher' : 'Masquer'"
            @click="toggleHidden(deck)"
          >
            <font-awesome-icon :icon="['fa', deck.hidden ? 'eye' : 'eye-slash']" />
          </button>
          <button
            class="btn btn-outline-secondary ms-1"
            aria-label="Feuille PDF"
            title="Feuille de tournoi (PDF)"
            @click="openSheet(deck)"
          >
            <font-awesome-icon :icon="['fa', 'file-pdf']" />
          </button>
          <button
            class="btn btn-outline-danger ms-1"
            aria-label="Supprimer"
            title="Supprimer"
            @click="remove(deck, deck.name)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="9">
          <em>Aucun deck</em>
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
</template>
