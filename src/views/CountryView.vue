<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useCountriesStore } from '@/stores'
import type { Country } from '@/types/models/Country'
import { ref } from 'vue'
import CountryFlag from 'vue-country-flag-next'
import CountryModal from './modals/CountryModal.vue'

const countryModalRef = ref<InstanceType<typeof CountryModal> | null>(null)
const selectedCountry = ref<Country | null>(null)

const {
  items: countries,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload: filterCountries,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(useCountriesStore(), {
  sort: { sortBy: 'name', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
  }),
})

function openCountryModal(country: Country | null = null) {
  selectedCountry.value = country
  if (null !== countryModalRef.value) {
    countryModalRef.value.showModal()
  }
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Pays</h2>
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
      <button class="btn btn-primary" @click="openCountryModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="country_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="country_name"
          id="country_name"
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
    <tbody v-else-if="countries.length">
      <tr v-for="country in countries" :key="country.id">
        <td>{{ country.id }}</td>
        <td class="align-middle">
          <div class="d-flex align-items-center gap-2">
            <country-flag :country="country.code" size="medium" class="m-0" />
            <span>{{ country.name }}</span>
          </div>
        </td>
        <td>{{ country.position }}</td>
        <td>
          <button class="btn btn-primary" @click="openCountryModal(country)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="4">
          <em>Aucun pays</em>
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
  <CountryModal
    ref="countryModalRef"
    :country="selectedCountry ?? undefined"
    @country-saved="filterCountries"
  />
</template>
