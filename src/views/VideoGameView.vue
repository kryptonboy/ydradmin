<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useVideoGamesStore, useVideoGameSupportsStore } from '@/stores'
import type { Filters } from '@/types/Api'
import type { VideoGameSupport } from '@/types/models/VideoGameSupport'
import { onMounted, ref } from 'vue'

const supports = ref<VideoGameSupport[]>([])

const {
  items: games,
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
} = useListView(useVideoGamesStore(), {
  sort: { sortBy: 'id', sortDir: 'desc' },
  createFilters: () => ({
    title: null as string | null,
    search: null as string | null,
    videoGameSupport: null as number | null,
    visible: null as string | null,
  }),
  toQuery: (f): Filters => ({
    title: f.title || null,
    search: f.search || null,
    videoGameSupport: f.videoGameSupport,
    visible: f.visible,
  }),
})

onMounted(async () => {
  supports.value = await useVideoGameSupportsStore().fetchAll()
})
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Jeux vidéo</h2>
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
      <AppLink to="/video_game/game/new" class="btn btn-primary">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </AppLink>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="game_title" class="form-label">Titre</label>
        <input
          type="text"
          class="form-control"
          id="game_title"
          placeholder="Filtrer par titre..."
          v-model="filters.title"
        />
      </div>
      <div class="col-3">
        <label for="game_search" class="form-label">Texte du contenu</label>
        <input
          type="text"
          class="form-control"
          id="game_search"
          placeholder="Rechercher dans le contenu..."
          v-model="filters.search"
        />
      </div>
      <div class="col-2">
        <label for="game_support" class="form-label">Support</label>
        <select class="form-select" id="game_support" v-model="filters.videoGameSupport">
          <option :value="null">Tous</option>
          <option v-for="support in supports" :key="support.id" :value="support.id">
            {{ support.name }}
          </option>
        </select>
      </div>
      <div class="col-2">
        <label for="game_visible" class="form-label">État</label>
        <select class="form-select" id="game_visible" v-model="filters.visible">
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
        <SortableHeader field="title" :sort="sort" @sort="setSort">Titre</SortableHeader>
        <th scope="col">Support</th>
        <th scope="col">État</th>
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
    <tbody v-else-if="games.length">
      <tr v-for="game in games" :key="game.id">
        <td>{{ game.id }}</td>
        <td>{{ game.title }}</td>
        <td>{{ game.videoGameSupport.name }}</td>
        <td>
          <span class="badge" :class="game.visible ? 'text-bg-success' : 'text-bg-secondary'">
            {{ game.visible ? 'Publié' : 'Brouillon' }}
          </span>
        </td>
        <td>
          <AppLink
            :to="`/video_game/game/${game.id}`"
            class="btn btn-primary"
            aria-label="Modifier le jeu vidéo"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </AppLink>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5">
          <em>Aucun jeu vidéo</em>
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
</template>
