<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useRemoveAction } from '@/composables/useRemoveAction'
import { formatDateTime } from '@/helpers/date'
import { formatEuros } from '@/helpers/money'
import { useCardPricesStore, useExtensionsStore, useRaritiesStore } from '@/stores'
import type { Filters } from '@/types/Api'
import type { CardPrice } from '@/types/models/CardPrice'
import type { Extension } from '@/types/models/Extension'
import type { Rarity } from '@/types/models/Rarity'
import { onMounted, ref } from 'vue'
import CardPriceHistoryModal from './modals/CardPriceHistoryModal.vue'
import CardPriceImportModal from './modals/CardPriceImportModal.vue'
import CardPriceModal from './modals/CardPriceModal.vue'
import { cardPriceLabel } from '@/helpers/card'

const store = useCardPricesStore()
const extensionsStore = useExtensionsStore()

const priceModalRef = ref<InstanceType<typeof CardPriceModal> | null>(null)
const historyModalRef = ref<InstanceType<typeof CardPriceHistoryModal> | null>(null)
const selectedPrice = ref<CardPrice | null>(null)
const historyPrice = ref<CardPrice | null>(null)

const importModalRef = ref<InstanceType<typeof CardPriceImportModal> | null>(null)

const rarities = ref<Rarity[]>([])
const extensions = ref<Extension[]>([])
const extensionsLoading = ref(false)

onMounted(async () => {
  rarities.value = await useRaritiesStore().fetchAll()
})

async function searchExtensions(query: string) {
  if (!query) {
    extensions.value = []
    return
  }
  extensionsLoading.value = true
  try {
    extensions.value = await extensionsStore.autocomplete(query)
  } finally {
    extensionsLoading.value = false
  }
}

interface ListFilters {
  'card.name': string | null
  'card.reference': string | null
  rarity: Rarity[]
  extension: Extension[]
}

function toQuery(filters: ListFilters): Filters {
  return {
    // Recherche partielle côté API ; un champ vidé ne filtre plus
    'card.name': filters['card.name'] || null,
    'card.reference': filters['card.reference'] || null,
    rarity: filters.rarity.map((rarity) => rarity.id),
    extension: filters.extension.map((extension) => extension.id),
  }
}

const {
  items: prices,
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
  createFilters: (): ListFilters => ({
    'card.name': null,
    'card.reference': null,
    rarity: [],
    extension: [],
  }),
  toQuery,
})

const { removeError, remove } = useRemoveAction(store, reload)

function openPriceModal(price: CardPrice | null = null) {
  selectedPrice.value = price
  priceModalRef.value?.showModal()
}

function openHistory(price: CardPrice) {
  historyPrice.value = price
  historyModalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Prix de référence</h2>
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
      <button class="btn btn-outline-primary me-md-2" @click="importModalRef?.showModal()">
        <font-awesome-icon :icon="['fa', 'file-import']" />
        Importer un CSV
      </button>
      <button class="btn btn-primary" @click="openPriceModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="cardPrice_cardName" class="form-label">Nom de la carte</label>
        <input
          id="cardPrice_cardName"
          v-model="filters['card.name']"
          type="text"
          class="form-control"
          placeholder="Filtrer par nom..."
        />
      </div>
      <div class="col-3">
        <label for="cardPrice_cardReference" class="form-label">Référence</label>
        <input
          id="cardPrice_cardReference"
          v-model="filters['card.reference']"
          type="text"
          class="form-control"
          placeholder="Ex. LOB-FR001"
        />
      </div>
      <div class="col-3">
        <label for="cardPrice_rarity" class="form-label">Rareté</label>
        <multi-select
          id="cardPrice_rarity"
          v-model="filters.rarity"
          :options="rarities"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par rareté..."
        />
      </div>
      <div class="col-3">
        <label for="cardPrice_extension" class="form-label">Extension</label>
        <multi-select
          id="cardPrice_extension"
          v-model="filters.extension"
          :options="extensions"
          :multiple="true"
          :searchable="true"
          :internal-search="false"
          :close-on-select="false"
          :loading="extensionsLoading"
          label="name"
          track-by="id"
          placeholder="Rechercher une extension..."
          @search-change="searchExtensions"
        />
      </div>
      <div class="col-2 ms-auto d-flex flex-column gap-2">
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
  <div v-if="removeError" class="alert alert-danger" role="alert">{{ removeError }}</div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="card.reference" :sort="sort" @sort="setSort">Carte</SortableHeader>
        <th scope="col">Rareté</th>
        <SortableHeader field="amount" :sort="sort" @sort="setSort">Prix</SortableHeader>
        <SortableHeader field="updatedAt" :sort="sort" @sort="setSort">Mis à jour</SortableHeader>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="6" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="prices.length">
      <tr v-for="price in prices" :key="price.id">
        <td>{{ price.id }}</td>
        <td>
          {{ cardPriceLabel(price.card) }}
          <div v-if="price.card.extension" class="small text-muted">
            {{ price.card.extension.name }}
          </div>
        </td>
        <td>{{ price.rarity.name }}</td>
        <td class="text-nowrap">{{ formatEuros(price.amount) }}</td>
        <td>{{ formatDateTime(price.updatedAt) }}</td>
        <td class="text-nowrap">
          <button
            class="btn btn-outline-secondary"
            aria-label="Historique"
            title="Historique"
            @click="openHistory(price)"
          >
            <font-awesome-icon :icon="['fa', 'chart-line']" />
          </button>
          <button
            class="btn btn-primary ms-1"
            aria-label="Modifier"
            title="Modifier"
            @click="openPriceModal(price)"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <button
            class="btn btn-outline-danger ms-1"
            aria-label="Supprimer"
            title="Supprimer"
            @click="remove(price, `${cardPriceLabel(price.card)} — ${price.rarity.name}`)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="6" class="text-center">
          <em>Aucun prix de référence</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="6" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <CardPriceModal ref="priceModalRef" :card-price="selectedPrice ?? undefined" @saved="reload" />
  <CardPriceHistoryModal ref="historyModalRef" :card-price="historyPrice" />
  <CardPriceImportModal ref="importModalRef" @imported="reload" />
</template>
