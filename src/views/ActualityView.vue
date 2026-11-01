<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppPaginator from '@/components/AppPaginator.vue'
import BooleanToIcon from '@/components/BooleanToIcon.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { formatDateTime } from '@/helpers/date'
import { useActualitiesStore, useActualityCategoriesStore } from '@/stores'
import type { Filters } from '@/types/Api'
import type { Actuality } from '@/types/models/Actuality'
import type { ActualityCategory } from '@/types/models/ActualityCategory'
import { onMounted, ref } from 'vue'

const categories = ref<ActualityCategory[]>([])

const {
  items: actualities,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(useActualitiesStore(), {
  sort: { sortBy: 'publishedAt', sortDir: 'desc' },
  createFilters: () => ({
    title: null as string | null,
    search: null as string | null,
    actualityCategory: null as number | null,
  }),
  toQuery: (f): Filters => ({
    title: f.title || null,
    search: f.search || null,
    actualityCategory: f.actualityCategory,
  }),
})

onMounted(async () => {
  categories.value = await useActualityCategoriesStore().fetchAll()
})

type Status = { label: string; badge: string }

/** Les administrateurs voient aussi les brouillons, articles masqués et publications futures. */
function status(actuality: Actuality): Status {
  if (!actuality.visible) return { label: 'Masquée', badge: 'text-bg-secondary' }
  if (actuality.publishedAt && new Date(actuality.publishedAt) > new Date()) {
    return { label: 'Planifiée', badge: 'text-bg-info' }
  }
  return { label: 'Publiée', badge: 'text-bg-success' }
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Actualités</h2>
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
      <AppLink to="/content/actuality/new" class="btn btn-primary">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </AppLink>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="actuality_title" class="form-label">Titre</label>
        <input
          type="text"
          class="form-control"
          id="actuality_title"
          placeholder="Filtrer par titre..."
          v-model="filters.title"
        />
      </div>
      <div class="col-3">
        <label for="actuality_search" class="form-label">Texte du contenu</label>
        <input
          type="text"
          class="form-control"
          id="actuality_search"
          placeholder="Rechercher dans le contenu..."
          v-model="filters.search"
        />
      </div>
      <div class="col-3">
        <label for="actuality_category" class="form-label">Catégorie</label>
        <select class="form-select" id="actuality_category" v-model="filters.actualityCategory">
          <option :value="null">Toutes</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.label }}
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
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="title" :sort="sort" @sort="setSort">Titre</SortableHeader>
        <th scope="col">Catégorie</th>
        <th scope="col">État</th>
        <th scope="col">Commentaires</th>
        <SortableHeader field="publishedAt" :sort="sort" @sort="setSort"
          >Publication</SortableHeader
        >
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="7" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="actualities.length">
      <tr v-for="actuality in actualities" :key="actuality.id">
        <td>{{ actuality.id }}</td>
        <td>{{ actuality.title }}</td>
        <td>{{ actuality.actualityCategory?.label }}</td>
        <td>
          <span class="badge" :class="status(actuality).badge">{{ status(actuality).label }}</span>
        </td>
        <td><BooleanToIcon :field="actuality.commentable" /></td>
        <td>{{ formatDateTime(actuality.publishedAt) }}</td>
        <td>
          <AppLink
            :to="`/content/actuality/${actuality.id}`"
            class="btn btn-primary"
            aria-label="Modifier l'actualité"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </AppLink>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="7">
          <em>Aucune actualité</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="7" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
</template>
