<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useRemoveAction } from '@/composables/useRemoveAction'
import { useCardGroupsStore, useGameFormatsStore, useRestrictionsStore } from '@/stores'
import type { Filters } from '@/types/Api'
import type { CardGroup } from '@/types/models/CardGroup'
import type { GameFormat } from '@/types/models/GameFormat'
import { LIMIT_LABELS, type LimitNumber, type Restriction } from '@/types/models/Restriction'
import { onMounted, ref } from 'vue'
import RestrictionModal from './modals/RestrictionModal.vue'

const modalRef = ref<InstanceType<typeof RestrictionModal> | null>(null)
const selected = ref<Restriction | null>(null)
const gameFormats = ref<GameFormat[]>([])
const cardGroupOptions = ref<CardGroup[]>([])
const cardGroupLoading = ref(false)
const limits = Object.entries(LIMIT_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}))

const {
  items: restrictions,
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
} = useListView(useRestrictionsStore(), {
  sort: { sortBy: 'gameFormat.name', sortDir: 'asc' },
  createFilters: () => ({
    gameFormat: null as number | null,
    cardGroup: null as CardGroup | null,
    limitNumber: null as number | null,
  }),
  toQuery: (f): Filters => ({
    gameFormat: f.gameFormat,
    cardGroup: f.cardGroup?.id ?? null,
    limitNumber: f.limitNumber,
  }),
})

const { removeError, remove } = useRemoveAction(useRestrictionsStore(), reload)

onMounted(async () => {
  gameFormats.value = await useGameFormatsStore().fetchAll()
})

async function fetchCardGroups(query: string) {
  cardGroupLoading.value = true
  cardGroupOptions.value = await useCardGroupsStore().autocomplete(query)
  cardGroupLoading.value = false
}

const limitLabel = (limit: number) => LIMIT_LABELS[limit as LimitNumber] ?? String(limit)

function openModal(restriction: Restriction | null = null) {
  selected.value = restriction
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Restrictions</h2>
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
        <label for="restriction_format" class="form-label">Format de jeu</label>
        <select class="form-select" id="restriction_format" v-model="filters.gameFormat">
          <option :value="null">Tous</option>
          <option v-for="format in gameFormats" :key="format.id" :value="format.id">
            {{ format.name }}
          </option>
        </select>
      </div>
      <div class="col-4">
        <label for="restriction_group" class="form-label">Groupe de cartes</label>
        <multi-select
          id="restriction_group"
          v-model="filters.cardGroup"
          :options="cardGroupOptions"
          :searchable="true"
          :loading="cardGroupLoading"
          :internal-search="false"
          :close-on-select="true"
          label="name"
          track-by="id"
          placeholder="Rechercher un groupe"
          @search-change="fetchCardGroups"
        />
      </div>
      <div class="col-2">
        <label for="restriction_limit" class="form-label">Limite</label>
        <select class="form-select" id="restriction_limit" v-model="filters.limitNumber">
          <option :value="null">Toutes</option>
          <option v-for="limit in limits" :key="limit.value" :value="limit.value">
            {{ limit.label }}
          </option>
        </select>
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
        <SortableHeader field="gameFormat.name" :sort="sort" @sort="setSort">
          Format de jeu
        </SortableHeader>
        <SortableHeader field="cardGroup.name" :sort="sort" @sort="setSort">
          Groupe de cartes
        </SortableHeader>
        <SortableHeader field="limitNumber" :sort="sort" @sort="setSort">Limite</SortableHeader>
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
    <tbody v-else-if="restrictions.length">
      <tr v-for="restriction in restrictions" :key="restriction.id">
        <td>{{ restriction.id }}</td>
        <td>{{ restriction.gameFormat.name }}</td>
        <td>{{ restriction.cardGroup.name }}</td>
        <td>{{ limitLabel(restriction.limitNumber) }}</td>
        <td>
          <button
            class="btn btn-primary"
            aria-label="Modifier la restriction"
            @click="openModal(restriction)"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <button
            class="btn btn-outline-danger ms-1"
            aria-label="Supprimer la restriction"
            title="Supprimer"
            @click="
              remove(restriction, `${restriction.cardGroup.name} / ${restriction.gameFormat.name}`)
            "
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5">
          <em>Aucune restriction</em>
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
  <RestrictionModal ref="modalRef" :restriction="selected ?? undefined" @saved="reload" />
</template>
