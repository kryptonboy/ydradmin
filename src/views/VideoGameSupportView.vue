<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { getErrorMessage } from '@/helpers/api-error'
import { useVideoGameSupportsStore } from '@/stores'
import type { VideoGameSupport } from '@/types/models/VideoGameSupport'
import { ref } from 'vue'
import VideoGameSupportModal from './modals/VideoGameSupportModal.vue'

const modalRef = ref<InstanceType<typeof VideoGameSupportModal> | null>(null)
const selected = ref<VideoGameSupport | null>(null)
const store = useVideoGameSupportsStore()

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
  sort: { sortBy: 'position', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
  }),
})

const deleteError = ref<string | null>(null)

async function remove(support: VideoGameSupport) {
  if (!window.confirm(`Supprimer « ${support.name} » ?`)) return
  deleteError.value = null
  try {
    await store.remove(support.id)
    await reload()
  } catch (err) {
    deleteError.value = getErrorMessage(err)
  }
}

function openModal(support: VideoGameSupport | null = null) {
  selected.value = support
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Supports de jeux vidéo</h2>
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
        <label for="videoGameSupport_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          id="videoGameSupport_name"
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
  <div v-if="deleteError" class="alert alert-danger" role="alert">{{ deleteError }}</div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="name" :sort="sort" @sort="setSort">Nom</SortableHeader>
        <SortableHeader field="position" :sort="sort" @sort="setSort">Position</SortableHeader>
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
    <tbody v-else-if="items.length">
      <tr v-for="support in items" :key="support.id">
        <td>{{ support.id }}</td>
        <td>{{ support.name }}</td>
        <td>{{ support.position }}</td>
        <td>
          <button class="btn btn-primary" aria-label="Modifier" @click="openModal(support)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <button
            class="btn btn-outline-danger ms-1"
            title="Supprimer"
            aria-label="Supprimer"
            @click="remove(support)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="4">
          <em>Aucun support</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="4" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <VideoGameSupportModal ref="modalRef" :support="selected ?? undefined" @saved="reload" />
</template>
