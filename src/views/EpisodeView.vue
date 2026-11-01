<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useAnimesStore, useEpisodesStore } from '@/stores'
import type { Filters } from '@/types/Api'
import type { Anime } from '@/types/models/Anime'
import { onMounted, ref } from 'vue'

const animes = ref<Anime[]>([])

const {
  items: episodes,
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
} = useListView(useEpisodesStore(), {
  sort: { sortBy: 'id', sortDir: 'desc' },
  createFilters: () => ({
    title: null as string | null,
    search: null as string | null,
    anime: null as number | null,
    visible: null as string | null,
  }),
  toQuery: (f): Filters => ({
    title: f.title || null,
    search: f.search || null,
    anime: f.anime,
    visible: f.visible,
  }),
})

onMounted(async () => {
  animes.value = await useAnimesStore().fetchAll()
})
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Épisodes</h2>
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
      <AppLink to="/anime_manga/episode/new" class="btn btn-primary">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </AppLink>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="episode_title" class="form-label">Titre</label>
        <input
          type="text"
          class="form-control"
          id="episode_title"
          placeholder="Filtrer par titre..."
          v-model="filters.title"
        />
      </div>
      <div class="col-3">
        <label for="episode_search" class="form-label">Texte du résumé</label>
        <input
          type="text"
          class="form-control"
          id="episode_search"
          placeholder="Rechercher dans le résumé..."
          v-model="filters.search"
        />
      </div>
      <div class="col-2">
        <label for="episode_anime" class="form-label">Animé</label>
        <select class="form-select" id="episode_anime" v-model="filters.anime">
          <option :value="null">Tous</option>
          <option v-for="anime in animes" :key="anime.id" :value="anime.id">
            {{ anime.name }}
          </option>
        </select>
      </div>
      <div class="col-2">
        <label for="episode_visible" class="form-label">État</label>
        <select class="form-select" id="episode_visible" v-model="filters.visible">
          <option :value="null">Tous</option>
          <option value="true">Publiés</option>
          <option value="false">Brouillons</option>
        </select>
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
        <SortableHeader field="episodeNumber" :sort="sort" @sort="setSort">N°</SortableHeader>
        <SortableHeader field="title" :sort="sort" @sort="setSort">Titre</SortableHeader>
        <th scope="col">Animé</th>
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
    <tbody v-else-if="episodes.length">
      <tr v-for="episode in episodes" :key="episode.id">
        <td>{{ episode.id }}</td>
        <td>{{ episode.episodeNumber }}</td>
        <td>{{ episode.title }}</td>
        <td>{{ episode.anime?.name }}</td>
        <td>
          <span class="badge" :class="episode.visible ? 'text-bg-success' : 'text-bg-secondary'">
            {{ episode.visible ? 'Publié' : 'Brouillon' }}
          </span>
        </td>
        <td>
          <AppLink
            :to="`/anime_manga/episode/${episode.id}`"
            class="btn btn-primary"
            aria-label="Modifier l'épisode"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </AppLink>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="6">
          <em>Aucun épisode</em>
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
