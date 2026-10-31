<script setup lang="ts">
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useExtensionsStore } from '@/stores/extensions.store'
import { onMounted, ref } from 'vue'
import ExtensionModal from './modals/ExtensionModal.vue'
import type { Extension } from '@/types/models/Extension'
import type { ExtensionType } from '@/types/models/ExtensionType'
import type { Country } from '@/types/models/Country'
import type { Filters } from '@/types/Api'
import { useCountriesStore, useExtensionTypesStore } from '@/stores'
import AppPaginator from '@/components/AppPaginator.vue'

const extensionsStore = useExtensionsStore()
const extensionTypesStore = useExtensionTypesStore()
const countriesStore = useCountriesStore()

const extensionModalRef = ref<InstanceType<typeof ExtensionModal> | null>(null)
const selectedExtension = ref<Extension | null>(null)

const extensionTypes = ref<ExtensionType[]>([])
const countries = ref<Country[]>([])

const createFilters = () => ({
  name: null as string | null,
  extensionType: [] as ExtensionType[],
  country: null as Country | null,
})
type ListFilters = ReturnType<typeof createFilters>

function toQuery(filters: ListFilters): Filters {
  return {
    name: filters.name,
    extensionType: filters.extensionType.map((ext) => ext.id),
    country: filters.country?.id ?? null,
  }
}

const {
  items: extensions,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload: filterExtensions,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(extensionsStore, {
  sort: { sortBy: 'releaseDate', sortDir: 'asc' },
  createFilters,
  toQuery,
})

function openExtensionModal(extension: Extension | null = null) {
  selectedExtension.value = extension
  if (null !== extensionModalRef.value) {
    extensionModalRef.value.showModal()
  }
}

function formatDate(date: string | Date | undefined | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(async () => {
  extensionTypes.value = await extensionTypesStore.fetchAll()
  countries.value = await countriesStore.fetchAll()
})

filterExtensions()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Extensions</h2>
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
      <button class="btn btn-primary" @click="openExtensionModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="extension_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="extension_name"
          id="extension_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="extension_type" class="form-label">Type d'extension</label>
        <multi-select
          v-model="filters.extensionType"
          :options="extensionTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par type d'extension..."
        />
      </div>
      <div class="col-3">
        <label for="extension_country" class="form-label">Pays</label>
        <multi-select
          v-model="filters.country"
          :options="countries"
          label="name"
          track-by="id"
          placeholder="Filtrer par pays..."
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
        <th scope="col">Référence</th>
        <th scope="col">Nb de cartes</th>
        <SortableHeader field="releaseDate" :sort="sort" @sort="setSort"
          >Date de release</SortableHeader
        >
        <th scope="col">Type d'extension</th>
        <th scope="col">Pays</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="8" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="extensions.length">
      <tr v-for="extension in extensions" :key="extension.id">
        <td>{{ extension.id }}</td>
        <td>{{ extension.name }}</td>
        <td>{{ extension.reference }}</td>
        <td>{{ extension.cardsCount }}</td>
        <td>{{ formatDate(extension.releaseDate) }}</td>
        <td>{{ extension.extensionType.name }}</td>
        <td>{{ extension.country.name }}</td>
        <td>
          <button class="btn btn-primary" @click="openExtensionModal(extension)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="8">
          <em>Aucune extension</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="8" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <ExtensionModal
    ref="extensionModalRef"
    :extension="selectedExtension ?? undefined"
    @extension-saved="filterExtensions"
  />
</template>
