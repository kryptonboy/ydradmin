<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import BooleanToIcon from '@/components/BooleanToIcon.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useAstrologicalSignsStore } from '@/stores'
import type { AstrologicalSign } from '@/types/models/AstrologicalSign'
import { ref } from 'vue'
import AstrologicalSignModal from './modals/AstrologicalSignModal.vue'

const modalRef = ref<InstanceType<typeof AstrologicalSignModal> | null>(null)
const selected = ref<AstrologicalSign | null>(null)
const store = useAstrologicalSignsStore()

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
  sort: { sortBy: 'id', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
  }),
})

function openModal(sign: AstrologicalSign | null = null) {
  selected.value = sign
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Signes astrologiques</h2>
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
        <label for="astrologicalSign_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          id="astrologicalSign_name"
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
        <th scope="col">Période</th>
        <th scope="col">Icône</th>
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
    <tbody v-else-if="items.length">
      <tr v-for="sign in items" :key="sign.id">
        <td>{{ sign.id }}</td>
        <td>{{ sign.name }}</td>
        <td>{{ sign.startDay }}/{{ sign.startMonth }} → {{ sign.endDay }}/{{ sign.endMonth }}</td>
        <td><BooleanToIcon :field="!!sign.icon" /></td>
        <td>
          <button class="btn btn-primary" aria-label="Modifier" @click="openModal(sign)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5">
          <em>Aucun signe</em>
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
  <AstrologicalSignModal ref="modalRef" :sign="selected ?? undefined" @saved="reload" />
</template>
