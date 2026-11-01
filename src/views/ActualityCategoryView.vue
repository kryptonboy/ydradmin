<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import BooleanToIcon from '@/components/BooleanToIcon.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useActualityCategoriesStore } from '@/stores'
import type { ActualityCategory } from '@/types/models/ActualityCategory'
import { ref } from 'vue'
import ActualityCategoryModal from './modals/ActualityCategoryModal.vue'

const modalRef = ref<InstanceType<typeof ActualityCategoryModal> | null>(null)
const selected = ref<ActualityCategory | null>(null)

const {
  items: categories,
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
} = useListView(useActualityCategoriesStore(), {
  sort: { sortBy: 'id', sortDir: 'asc' },
  createFilters: () => ({
    label: null as string | null,
  }),
})

function openModal(category: ActualityCategory | null = null) {
  selected.value = category
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Catégories d'actualités</h2>
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
        <label for="category_label" class="form-label">Libellé</label>
        <input
          type="text"
          class="form-control"
          id="category_label"
          placeholder="Filtrer par libellé..."
          v-model="filters.label"
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
        <SortableHeader field="label" :sort="sort" @sort="setSort">Libellé</SortableHeader>
        <th scope="col">Identifiant URL</th>
        <th scope="col">Active</th>
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
    <tbody v-else-if="categories.length">
      <tr v-for="category in categories" :key="category.id">
        <td>{{ category.id }}</td>
        <td>{{ category.label }}</td>
        <td>{{ category.slug }}</td>
        <td><BooleanToIcon :field="category.active" /></td>
        <td>
          <button
            class="btn btn-primary"
            aria-label="Modifier la catégorie"
            @click="openModal(category)"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5">
          <em>Aucune catégorie</em>
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
  <ActualityCategoryModal
    ref="modalRef"
    :category="selected ?? undefined"
    @category-saved="reload"
  />
</template>
