<script setup lang="ts">
import { useCardSubTypesStore } from '@/stores/card_sub_types.store'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import CardSubTypeModal from './modals/CardSubTypeModal.vue'
import type { CardSubType } from '@/types/models/CardSubType'
import type { Filters, Sort } from '@/types/Api'
import type { CardType } from '@/types/models/CardType'
import { useCardTypesStore } from '@/stores/card_types.store'
import Paginator from '@/components/Paginator.vue'

const cardSubTypesStore = useCardSubTypesStore()
const cardTypesStore = useCardTypesStore()
const { items: cardSubTypes, loading, pagination } = storeToRefs(cardSubTypesStore)

const cardSubTypeModalRef = ref<InstanceType<typeof CardSubTypeModal> | null>(null)
const selectedCardSubType = ref<CardSubType | null>(null)

const currentPage = ref<number>(1)
const cardTypes = ref<CardType[]>([])

const sort = ref<Sort>({
  sortBy: 'name',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
  cardType: [] as CardType[],
})

function setSort(field: 'id' | 'name' | 'position') {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
  filterCardSubTypes()
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilters() {
  filters.name = null
  filters.cardType = []
  currentPage.value = 1
  filterCardSubTypes()
}

function applyFilters() {
  currentPage.value = 1
  filterCardSubTypes()
}

function openCardSubTypeModal(cardSubType: CardSubType | null = null) {
  selectedCardSubType.value = cardSubType
  if (null !== cardSubTypeModalRef.value) {
    cardSubTypeModalRef.value.showModal()
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage
  filterCardSubTypes()
}

function processFilters(): Filters {
  return {
    name: filters.name,
    cardType: filters.cardType.map((ct) => ct.id),
  }
}

function filterCardSubTypes() {
  const processedFilters = processFilters()
  cardSubTypesStore.filter(processedFilters, sort.value, currentPage.value)
}

const nbFilters = computed(() => {
  let nbFilters = 0

  for (const filterValue of Object.values(filters)) {
    if (Array.isArray(filterValue)) {
      if (filterValue.length > 0) {
        nbFilters++
      }
      continue
    }
    if (null !== filterValue) nbFilters++
  }

  return nbFilters
})

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
        <th scope="col" @click="setSort('id')" role="button">
          #
          <font-awesome-icon v-if="sort.sortBy === 'id'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('name')" role="button">
          Nom
          <font-awesome-icon v-if="sort.sortBy === 'name'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('position')" role="button">
          Position
          <font-awesome-icon v-if="sort.sortBy === 'position'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
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
          <Paginator
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
