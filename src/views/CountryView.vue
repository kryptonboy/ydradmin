<script setup lang="ts">
import { useCountriesStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref } from 'vue'
import CountryModal from './modals/CountryModal.vue'
import type { Country } from '@/types/models/Country'
import type { Sort } from '@/types/Api'
import AppPaginator from '@/components/AppPaginator.vue'

const countriesStore = useCountriesStore()
const { items: countries, loading, pagination } = storeToRefs(countriesStore)

const countryModalRef = ref<InstanceType<typeof CountryModal> | null>(null)
const selectedCountry = ref<Country | null>(null)

const currentPage = ref<number>(1)

const sort = ref<Sort>({
  sortBy: 'name',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
})

function setSort(field: 'id' | 'name' | 'position') {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
  filterCountries()
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilter() {
  filters.name = null
  currentPage.value = 1
  filterCountries()
}

function applyFilters() {
  currentPage.value = 1
  filterCountries()
}

function openCountryModal(country: Country | null = null) {
  selectedCountry.value = country
  if (null !== countryModalRef.value) {
    countryModalRef.value.showModal()
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage
  filterCountries()
}

function filterCountries() {
  countriesStore.filter(filters, sort.value, currentPage.value)
}

const nbFilters = computed(() => {
  let nbFilters = 0

  for (const filterValue of Object.values(filters)) {
    if (null !== filterValue) nbFilters++
  }

  return nbFilters
})

filterCountries()
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
          Position
          <font-awesome-icon v-if="sort.sortBy === 'position'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
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
