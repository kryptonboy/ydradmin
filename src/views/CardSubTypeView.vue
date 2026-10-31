<script setup lang="ts">
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useCardSubTypesStore } from '@/stores/card_sub_types.store'
import { onMounted, ref } from 'vue'
import CardSubTypeModal from './modals/CardSubTypeModal.vue'
import type { CardSubType } from '@/types/models/CardSubType'
import type { Filters } from '@/types/Api'
import type { CardType } from '@/types/models/CardType'
import { useCardTypesStore } from '@/stores/card_types.store'
import AppPaginator from '@/components/AppPaginator.vue'

const cardSubTypesStore = useCardSubTypesStore()
const cardTypesStore = useCardTypesStore()

const cardSubTypeModalRef = ref<InstanceType<typeof CardSubTypeModal> | null>(null)
const selectedCardSubType = ref<CardSubType | null>(null)

const cardTypes = ref<CardType[]>([])

const createFilters = () => ({
  name: null as string | null,
  cardType: [] as CardType[],
})
type ListFilters = ReturnType<typeof createFilters>

function toQuery(filters: ListFilters): Filters {
  return {
    name: filters.name,
    cardType: filters.cardType.map((ct) => ct.id),
  }
}

const {
  items: cardSubTypes,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload: filterCardSubTypes,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(cardSubTypesStore, {
  sort: { sortBy: 'name', sortDir: 'asc' },
  createFilters,
  toQuery,
})

function openCardSubTypeModal(cardSubType: CardSubType | null = null) {
  selectedCardSubType.value = cardSubType
  if (null !== cardSubTypeModalRef.value) {
    cardSubTypeModalRef.value.showModal()
  }
}

onMounted(async () => {
  cardTypes.value = await cardTypesStore.fetchAll()
})

filterCardSubTypes()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Sous-Types de carte</h2>
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
      <button class="btn btn-primary" @click="openCardSubTypeModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="card_sub_type_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="card_sub_type_name"
          id="card_sub_type_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="card_sub_type_card_type" class="form-label">Type de carte</label>
        <multi-select
          v-model="filters.cardType"
          :options="cardTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par type de carte..."
        />
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
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="name" :sort="sort" @sort="setSort">Nom</SortableHeader>
        <SortableHeader field="position" :sort="sort" @sort="setSort">Position</SortableHeader>
        <th scope="col">Type de carte</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="5" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="cardSubTypes.length">
      <tr v-for="cardSubType in cardSubTypes" :key="cardSubType.id" :class="cardSubType.cssClass">
        <td>{{ cardSubType.id }}</td>
        <td>{{ cardSubType.name }}</td>
        <td>{{ cardSubType.position }}</td>
        <td>{{ cardSubType.cardType?.name }}</td>
        <td class="actions">
          <button class="btn btn-primary" @click="openCardSubTypeModal(cardSubType)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5" class="text-center align-middle">
          <em>Aucun sous-type de carte</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="5" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <CardSubTypeModal
    ref="cardSubTypeModalRef"
    :card-sub-type="selectedCardSubType ?? undefined"
    @card-sub-type-saved="filterCardSubTypes"
  />
</template>
