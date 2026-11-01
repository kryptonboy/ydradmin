<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppPaginator from '@/components/AppPaginator.vue'
import MediaThumb from '@/components/MediaThumb.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { formatDate } from '@/helpers/date'
import { useMoviesStore } from '@/stores'
import type { Filters } from '@/types/Api'

const {
  items: movies,
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
} = useListView(useMoviesStore(), {
  sort: { sortBy: 'japanReleaseDate', sortDir: 'desc' },
  createFilters: () => ({
    title: null as string | null,
    search: null as string | null,
    visible: null as string | null,
  }),
  toQuery: (f): Filters => ({
    title: f.title || null,
    search: f.search || null,
    visible: f.visible,
  }),
})
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Films</h2>
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
      <AppLink to="/anime_manga/movie/new" class="btn btn-primary">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </AppLink>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-4">
        <label for="movie_title" class="form-label">Titre</label>
        <input
          type="text"
          class="form-control"
          id="movie_title"
          placeholder="Filtrer par titre..."
          v-model="filters.title"
        />
      </div>
      <div class="col-3">
        <label for="movie_search" class="form-label">Texte du contenu</label>
        <input
          type="text"
          class="form-control"
          id="movie_search"
          placeholder="Rechercher dans le contenu..."
          v-model="filters.search"
        />
      </div>
      <div class="col-2">
        <label for="movie_visible" class="form-label">État</label>
        <select class="form-select" id="movie_visible" v-model="filters.visible">
          <option :value="null">Tous</option>
          <option value="true">Publiés</option>
          <option value="false">Brouillons</option>
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
  <table class="table align-middle">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <th scope="col">Jaquette</th>
        <SortableHeader field="title" :sort="sort" @sort="setSort">Titre</SortableHeader>
        <SortableHeader field="japanReleaseDate" :sort="sort" @sort="setSort">
          Sortie au Japon
        </SortableHeader>
        <th scope="col">État</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="6" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="movies.length">
      <tr v-for="movie in movies" :key="movie.id">
        <td>{{ movie.id }}</td>
        <td>
          <MediaThumb :media="movie.coverImage" :alt="`Jaquette de ${movie.title}`" height="3rem" />
        </td>
        <td>{{ movie.title }}</td>
        <td>{{ formatDate(movie.japanReleaseDate) }}</td>
        <td>
          <span class="badge" :class="movie.visible ? 'text-bg-success' : 'text-bg-secondary'">
            {{ movie.visible ? 'Publié' : 'Brouillon' }}
          </span>
        </td>
        <td>
          <AppLink
            :to="`/anime_manga/movie/${movie.id}`"
            class="btn btn-primary"
            aria-label="Modifier le film"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </AppLink>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="6">
          <em>Aucun film</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="6" class="text-center pt-3 pb-0">
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
