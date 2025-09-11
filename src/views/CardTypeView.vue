<script setup lang="ts">
import { useCardTypesStore } from '@/stores/card_types.store'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import CardTypeModal from './modals/CardTypeModal.vue'
import type { CardType } from '@/types/models/CardType'
import type { Sort } from '@/types/Api'
import Paginator from '@/components/Paginator.vue'

const cardTypesStore = useCardTypesStore()
const { items: cardTypes, loading, pagination } = storeToRefs(cardTypesStore)

const cardTypeModalRef = ref<InstanceType<typeof CardTypeModal> | null>(null)
const selectedCardType = ref<CardType | null>(null)

const currentPage = ref<number>(1)

const sort = ref<Sort>({
  sortBy: 'name',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
})

function setSort(field: 'id' | 'name' | 'position') {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
  filterCardTypes()
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilters() {
  filters.name = null
  filterCardTypes()
}

function applyFilters() {
  currentPage.value = 1
  filterCardTypes()
}

function openCardTypeModal(cardType: CardType | null = null) {
  selectedCardType.value = cardType
  if (null !== cardTypeModalRef.value) {
    cardTypeModalRef.value.showModal()
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage
  filterCardTypes()
}

function filterCardTypes() {
  cardTypesStore.filter(filters, sort.value, currentPage.value)
}

const nbFilters = computed(() => {
  let nbFilters = 0

  for (const filterValue of Object.values(filters)) {
    if (null !== filterValue) nbFilters++
  }

  return nbFilters
})

filterCardTypes()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Types de carte</h2>
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
          {{ nbFilters }}</span
        >
      </button>
      <button class="btn btn-primary" @click="openCardTypeModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="card_type_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="card_type_name"
          id="card_type_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
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
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="4" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="cardTypes.length">
      <tr v-for="cardType in cardTypes" :key="cardType.id">
        <td>{{ cardType.id }}</td>
        <td>{{ cardType.name }}</td>
        <td>{{ cardType.position }}</td>
        <td>
          <button class="btn btn-primary" @click="openCardTypeModal(cardType)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="4">
          <em>Aucun type de carte</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="4" class="text-center pt-3 pb-0">
          <Paginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <CardTypeModal
    ref="cardTypeModalRef"
    :card-type="selectedCardType"
    @card-type-saved="filterCardTypes"
  />
</template>
