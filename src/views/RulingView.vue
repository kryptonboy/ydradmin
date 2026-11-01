<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useRemoveAction } from '@/composables/useRemoveAction'
import { useRulingsStore } from '@/stores'
import type { Filters } from '@/types/Api'
import type { Ruling } from '@/types/models/Ruling'
import { ref } from 'vue'
import RulingModal from './modals/RulingModal.vue'

const modalRef = ref<InstanceType<typeof RulingModal> | null>(null)
const selected = ref<Ruling | null>(null)

const {
  items: rulings,
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
} = useListView(useRulingsStore(), {
  sort: { sortBy: 'id', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
    ruling: null as string | null,
  }),
  toQuery: (f): Filters => ({
    name: f.name || null,
    ruling: f.ruling || null,
  }),
})

const { removeError, remove } = useRemoveAction(useRulingsStore(), reload)

function openModal(ruling: Ruling | null = null) {
  selected.value = ruling
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Rulings</h2>
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
      <div class="col-4">
        <label for="ruling_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          id="ruling_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-4">
        <label for="ruling_text" class="form-label">Texte du ruling</label>
        <input
          type="text"
          class="form-control"
          id="ruling_text"
          placeholder="Rechercher dans le texte..."
          v-model="filters.ruling"
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
  <div v-if="removeError" class="alert alert-danger" role="alert">{{ removeError }}</div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="name" :sort="sort" @sort="setSort">Nom</SortableHeader>
        <th scope="col">Ruling</th>
        <th scope="col">Cartes</th>
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
    <tbody v-else-if="rulings.length">
      <tr v-for="ruling in rulings" :key="ruling.id">
        <td>{{ ruling.id }}</td>
        <td>{{ ruling.name }}</td>
        <td class="text-truncate" style="max-width: 28rem">{{ ruling.ruling }}</td>
        <td>
          <span
            v-for="card in ruling.abstractCards"
            :key="card.id"
            class="badge text-bg-secondary me-1"
          >
            {{ card.name }}
          </span>
        </td>
        <td>
          <button
            class="btn btn-primary"
            aria-label="Modifier le ruling"
            @click="openModal(ruling)"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <button
            class="btn btn-outline-danger ms-1"
            aria-label="Supprimer le ruling"
            title="Supprimer"
            @click="remove(ruling, ruling.name)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5">
          <em>Aucun ruling</em>
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
  <RulingModal ref="modalRef" :ruling="selected ?? undefined" @saved="reload" />
</template>
