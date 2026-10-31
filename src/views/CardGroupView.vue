<script setup lang="ts">
import { useCardGroupsStore } from '@/stores/card_groups.store'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import CardGroupModal from './modals/CardGroupModal.vue'
import type { CardGroup } from '@/types/models/CardGroup'
import type { Sort } from '@/types/Api'

const cardGroupsStore = useCardGroupsStore()
const { items: cardGroups, loading, pagination } = storeToRefs(cardGroupsStore)

const cardGroupModalRef = ref<InstanceType<typeof CardGroupModal> | null>(null)
const selectedCardGroup = ref<CardGroup | null>(null)

const currentPage = ref<number>(1)

const sort = ref<Sort>({
  sortBy: 'name',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
})

function setSort(field: 'id' | 'name') {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
  filterCardGroups()
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilters() {
  filters.name = null
  currentPage.value = 1
  filterCardGroups()
}

function applyFilters() {
  currentPage.value = 1
  filterCardGroups()
}

function openCardGroupModal(cardGroup: CardGroup | null = null) {
  selectedCardGroup.value = cardGroup
  if (null !== cardGroupModalRef.value) {
    cardGroupModalRef.value.showModal()
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage
  filterCardGroups()
}

function filterCardGroups() {
  cardGroupsStore.filter(filters, sort.value, currentPage.value)
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

filterCardGroups()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Groupes de cartes</h2>
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
      <button class="btn btn-primary" @click="openCardGroupModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="card_group_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="card_group_name"
          id="card_group_name"
          placeholder="Filter par nom..."
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
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="3" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="cardGroups.length">
      <tr v-for="cardGroup in cardGroups" :key="cardGroup.id">
        <td>{{ cardGroup.id }}</td>
        <td>{{ cardGroup.name }}</td>
        <td>
          <button class="btn btn-primary" @click="openCardGroupModal(cardGroup)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="3" class="text-center">
          <em>Aucun groupe de cartes</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="3" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <CardGroupModal
    ref="cardGroupModalRef"
    :card-group="selectedCardGroup ?? undefined"
    @card-group-saved="filterCardGroups"
  />
</template>
