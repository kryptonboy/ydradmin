<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useRemoveAction } from '@/composables/useRemoveAction'
import { useGradingCompaniesStore } from '@/stores'
import type { GradingCompany } from '@/types/models/GradingCompany'
import { ref } from 'vue'
import GradingCompanyModal from './modals/GradingCompanyModal.vue'

const gradingCompanyModalRef = ref<InstanceType<typeof GradingCompanyModal> | null>(null)
const selectedGradingCompany = ref<GradingCompany | null>(null)

const {
  items: gradingCompanies,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload: filterGradingCompanies,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(useGradingCompaniesStore(), {
  sort: { sortBy: 'name', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
  }),
})

const { removeError, remove } = useRemoveAction(useGradingCompaniesStore(), filterGradingCompanies)

function openGradingCompanyModal(gradingCompany: GradingCompany | null = null) {
  selectedGradingCompany.value = gradingCompany
  if (null !== gradingCompanyModalRef.value) {
    gradingCompanyModalRef.value.showModal()
  }
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Sociétés de gradation</h2>
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
      <button class="btn btn-primary" @click="openGradingCompanyModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="gradingCompany_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="gradingCompany_name"
          id="gradingCompany_name"
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
  <div v-if="removeError" class="alert alert-danger" role="alert">{{ removeError }}</div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="name" :sort="sort" @sort="setSort">Nom</SortableHeader>
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
    <tbody v-else-if="gradingCompanies.length">
      <tr v-for="gradingCompany in gradingCompanies" :key="gradingCompany.id">
        <td>{{ gradingCompany.id }}</td>
        <td>{{ gradingCompany.name }}</td>
        <td>
          <button class="btn btn-primary" @click="openGradingCompanyModal(gradingCompany)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <button
            class="btn btn-outline-danger ms-1"
            aria-label="Supprimer"
            title="Supprimer"
            @click="remove(gradingCompany, gradingCompany.name)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="3" class="text-center">
          <em>Aucune société de gradation</em>
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
  <GradingCompanyModal
    ref="gradingCompanyModalRef"
    :grading-company="selectedGradingCompany ?? undefined"
    @grading-company-saved="filterGradingCompanies"
  />
</template>
