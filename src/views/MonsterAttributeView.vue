<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useRemoveAction } from '@/composables/useRemoveAction'
import { useMonsterAttributesStore } from '@/stores'
import type { MonsterAttribute } from '@/types/models/MonsterAttribute'
import { ref } from 'vue'
import MonsterAttributeModal from './modals/MonsterAttributeModal.vue'

const monsterAttributeModalRef = ref<InstanceType<typeof MonsterAttributeModal> | null>(null)
const selectedMonsterAttribute = ref<MonsterAttribute | null>(null)

const {
  items: monsterAttributes,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload: filterMonsterAttributes,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(useMonsterAttributesStore(), {
  sort: { sortBy: 'name', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
  }),
})

const { removeError, remove } = useRemoveAction(
  useMonsterAttributesStore(),
  filterMonsterAttributes,
)

function openMonsterAttributeModal(monsterAttribute: MonsterAttribute | null = null) {
  selectedMonsterAttribute.value = monsterAttribute
  if (null !== monsterAttributeModalRef.value) {
    monsterAttributeModalRef.value.showModal()
  }
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Attributs de monstre</h2>
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
      <button class="btn btn-primary" @click="openMonsterAttributeModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="monster_attribute_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="monster_attribute_name"
          id="monster_attribute_name"
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
    <tbody v-else-if="monsterAttributes.length">
      <tr v-for="monsterAttribute in monsterAttributes" :key="monsterAttribute.id">
        <td>{{ monsterAttribute.id }}</td>
        <td>{{ monsterAttribute.name }}</td>
        <td>
          <button class="btn btn-primary" @click="openMonsterAttributeModal(monsterAttribute)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <button
            class="btn btn-outline-danger ms-1"
            aria-label="Supprimer"
            title="Supprimer"
            @click="remove(monsterAttribute, monsterAttribute.name)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="3" class="text-center">
          <em>Aucun attribut de monstre</em>
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
  <MonsterAttributeModal
    ref="monsterAttributeModalRef"
    :monster-attribute="selectedMonsterAttribute ?? undefined"
    @monster-attribute-saved="filterMonsterAttributes"
  />
</template>
