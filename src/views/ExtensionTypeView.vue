<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useExtensionTypesStore } from '@/stores'
import type { ExtensionType } from '@/types/models/ExtensionType'
import { ref } from 'vue'
import ExtensionTypeModal from './modals/ExtensionTypeModal.vue'

const extensionTypeModalRef = ref<InstanceType<typeof ExtensionTypeModal> | null>(null)
const selectedExtensionType = ref<ExtensionType | null>(null)

const {
  items: extensionTypes,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload: filterExtensionTypes,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(useExtensionTypesStore(), {
  sort: { sortBy: 'position', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
  }),
})

function openExtensionTypeModal(extensionType: ExtensionType | null = null) {
  selectedExtensionType.value = extensionType
  if (null !== extensionTypeModalRef.value) {
    extensionTypeModalRef.value.showModal()
  }
}
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
        <SortableHeader field="position" :sort="sort" @sort="setSort">Ordre</SortableHeader>
        <SortableHeader field="extensionsCount" :sort="sort" @sort="setSort"
          >Nombre d'extensions</SortableHeader
        >
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
          <AppPaginator
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
    :extension-type="selectedExtensionType ?? undefined"
    @extension-type-saved="filterExtensionTypes"
  />
</template>
