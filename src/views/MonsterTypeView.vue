<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useMonsterTypesStore } from '@/stores'
import type { MonsterType } from '@/types/models/MonsterType'
import { ref } from 'vue'
import MonsterTypeModal from './modals/MonsterTypeModal.vue'

const monsterTypeModalRef = ref<InstanceType<typeof MonsterTypeModal> | null>(null)
const selectedMonsterType = ref<MonsterType | null>(null)

const {
  items: monsterTypes,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload: filterMonsterTypes,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(useMonsterTypesStore(), {
  sort: { sortBy: 'name', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
  }),
})

function openMonsterTypeModal(monsterType: MonsterType | null = null) {
  selectedMonsterType.value = monsterType
  if (null !== monsterTypeModalRef.value) {
    monsterTypeModalRef.value.showModal()
  }
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Types de monstre</h2>
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
      <button class="btn btn-primary" @click="openMonsterTypeModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="monster_type_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="monster_type_name"
          id="monster_type_name"
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
    <tbody v-else-if="monsterTypes.length">
      <tr v-for="monsterType in monsterTypes" :key="monsterType.id">
        <td>{{ monsterType.id }}</td>
        <td>{{ monsterType.name }}</td>
        <td>
          <button class="btn btn-primary" @click="openMonsterTypeModal(monsterType)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="3" class="text-center">
          <em>Aucun type de monstre</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="3" class="text-center pt-3 pn-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <MonsterTypeModal
    ref="monsterTypeModalRef"
    :monster-type="selectedMonsterType ?? undefined"
    @monster-type-saved="filterMonsterTypes"
  />
</template>
