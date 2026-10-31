<script setup lang="ts">
import { useMonsterEffectsStore } from '@/stores/monster_effects.store'
import { storeToRefs } from 'pinia'
import MonsterEffectModal from './modals/MonsterEffectModal.vue'
import type { MonsterEffect } from '@/types/models/MonsterEffect'
import { computed, reactive, ref } from 'vue'
import type { Sort } from '@/types/Api'
import Paginator from '@/components/Paginator.vue'

const monsterEffectsStore = useMonsterEffectsStore()
const { items: monsterEffects, loading, pagination } = storeToRefs(monsterEffectsStore)

const monsterEffectModalRef = ref<InstanceType<typeof MonsterEffectModal> | null>(null)
const selectedMonsterEffect = ref<MonsterEffect | null>(null)

const currentPage = ref<number>(1)

const sort = ref<Sort>({
  sortBy: 'name',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
  description: null as string | null,
})

function setSort(field: 'id' | 'name') {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
  filterMonsterEffects()
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilters() {
  filters.name = null
  filters.description = null
  currentPage.value = 1
  filterMonsterEffects()
}

function applyFilters() {
  currentPage.value = 1
  filterMonsterEffects()
}

function openMonsterEffectModal(monsterEffect: MonsterEffect | null = null) {
  selectedMonsterEffect.value = monsterEffect
  if (null !== monsterEffectModalRef.value) {
    monsterEffectModalRef.value.showModal()
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage
  filterMonsterEffects()
}

function filterMonsterEffects() {
  monsterEffectsStore.filter(filters, sort.value, currentPage.value)
}

const nbFilters = computed(() => {
  let nbFilters = 0

  for (const filterValue of Object.values(filters)) {
    if (Array.isArray(filterValue)) {
      if (filterValue.length > 0) nbFilters++
      continue
    }
    if (filterValue !== null) nbFilters++
  }

  return nbFilters
})

filterMonsterEffects()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Effets de mosntre</h2>
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
      <button class="btn btn-primary" @click="openMonsterEffectModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="monster_effect_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="monster_effect_name"
          id="monster_effect_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="monster_effect_description" class="form-label">Description</label>
        <input
          type="text"
          class="form-control"
          name="monster_effect_description"
          id="monster_effect_description"
          placeholder="Filtrer par description..."
          v-model="filters.description"
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
    <tbody v-else-if="monsterEffects.length">
      <tr v-for="monsterEffect in monsterEffects" :key="monsterEffect.id">
        <td>{{ monsterEffect.id }}</td>
        <td>{{ monsterEffect.name }}</td>
        <td>
          <button class="btn btn-primary" @click="openMonsterEffectModal(monsterEffect)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="3" class="text-center">
          <em>Aucun effet de monstre</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="4" class="text-center pt-3 pb-0">
          <Paginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <MonsterEffectModal
    ref="monsterEffectModalRef"
    :monster-effect="selectedMonsterEffect"
    @monster-effect-saved="filterMonsterEffects"
  />
</template>
