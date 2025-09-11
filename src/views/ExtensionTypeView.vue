<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { ExtensionType } from '@/types/models/ExtensionType'
import ExtensionTypeModal from './modals/ExtensionTypeModal.vue'
import type { Sort } from '@/types/Api'
import { useExtensionTypesStore } from '@/stores'

const extensionTypesStore = useExtensionTypesStore()
const { items: extensionTypes, loading, pagination } = storeToRefs(extensionTypesStore)

const extensionTypeModalRef = ref<InstanceType<typeof ExtensionTypeModal> | null>(null)
const selectedExtensionType = ref<ExtensionType | null>(null)

const currentPage = ref<number>(1)

const sort = ref<Sort>({
  sortBy: 'position',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
})

function setSort(field: 'id' | 'name' | 'position' | 'extensionsCount') {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
  filterExtensionTypes()
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilter() {
  filters.name = null
  currentPage.value = 1
  filterExtensionTypes()
}

function applyFilters() {
  currentPage.value = 1
  filterExtensionTypes()
}

function openExtensionTypeModal(extensionType: ExtensionType | null = null) {
  selectedExtensionType.value = extensionType
  if (null !== extensionTypeModalRef.value) {
    extensionTypeModalRef.value.showModal()
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage
  filterExtensionTypes()
}

function filterExtensionTypes() {
  extensionTypesStore.filter(filters, sort.value, currentPage.value)
}

const nbFilters = computed(() => {
  let nbFilters = 0

  for (const filterValue of Object.values(filters)) {
    if (null !== filterValue) nbFilters++
  }

  return nbFilters
})

filterExtensionTypes()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Types d'extension</h2>
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
      <button class="btn btn-primary" @click="openExtensionTypeModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="extension_type_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="extension_type_name"
          id="extension_type_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3 ms-auto d-flex flex-column gap-2">
        <button class="btn btn-secondary w-100" @click="resetFilter">
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
          Ordre
          <font-awesome-icon v-if="sort.sortBy === 'position'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('extensionsCount')" role="button">
          Nombre d'extensions
          <font-awesome-icon v-if="sort.sortBy === 'extensionsCount'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
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
    <tbody v-else-if="extensionTypes.length">
      <tr v-for="extensionType in extensionTypes" :key="extensionType.id">
        <td>{{ extensionType.id }}</td>
        <td>{{ extensionType.name }}</td>
        <td>{{ extensionType.position }}</td>
        <td>{{ extensionType.extensionsCount }}</td>
        <td>
          <button class="btn btn-primary" @click="openExtensionTypeModal(extensionType)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5">
          <em>Aucun type d'extension</em>
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
  <ExtensionTypeModal
    ref="extensionTypeModalRef"
    :extension-type="selectedExtensionType"
    @extension-type-saved="filterExtensionTypes"
  />
</template>
