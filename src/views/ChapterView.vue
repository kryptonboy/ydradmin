<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useMangasStore, useChaptersStore } from '@/stores'
import type { Filters } from '@/types/Api'
import type { Manga } from '@/types/models/Manga'
import { onMounted, ref } from 'vue'

const mangas = ref<Manga[]>([])

const {
  items: chapters,
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
} = useListView(useChaptersStore(), {
  sort: { sortBy: 'id', sortDir: 'desc' },
  createFilters: () => ({
    title: null as string | null,
    search: null as string | null,
    manga: null as number | null,
    visible: null as string | null,
  }),
  toQuery: (f): Filters => ({
    title: f.title || null,
    search: f.search || null,
    manga: f.manga,
    visible: f.visible,
  }),
})

onMounted(async () => {
  mangas.value = await useMangasStore().fetchAll()
})
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Chapitres</h2>
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
      <AppLink to="/anime_manga/chapter/new" class="btn btn-primary">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </AppLink>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="chapter_title" class="form-label">Titre</label>
        <input
          type="text"
          class="form-control"
          id="chapter_title"
          placeholder="Filtrer par titre..."
          v-model="filters.title"
        />
      </div>
      <div class="col-3">
        <label for="chapter_search" class="form-label">Texte du résumé</label>
        <input
          type="text"
          class="form-control"
          id="chapter_search"
          placeholder="Rechercher dans le résumé..."
          v-model="filters.search"
        />
      </div>
      <div class="col-2">
        <label for="chapter_manga" class="form-label">Manga</label>
        <select class="form-select" id="chapter_manga" v-model="filters.manga">
          <option :value="null">Tous</option>
          <option v-for="manga in mangas" :key="manga.id" :value="manga.id">
            {{ manga.name }}
          </option>
        </select>
      </div>
      <div class="col-2">
        <label for="chapter_visible" class="form-label">État</label>
        <select class="form-select" id="chapter_visible" v-model="filters.visible">
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
        <SortableHeader field="chapterNumber" :sort="sort" @sort="setSort">N°</SortableHeader>
        <SortableHeader field="title" :sort="sort" @sort="setSort">Titre</SortableHeader>
        <th scope="col">Manga</th>
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
    <tbody v-else-if="chapters.length">
      <tr v-for="chapter in chapters" :key="chapter.id">
        <td>{{ chapter.id }}</td>
        <td>{{ chapter.chapterNumber }}</td>
        <td>{{ chapter.title }}</td>
        <td>{{ chapter.manga.name }}</td>
        <td>
          <span class="badge" :class="chapter.visible ? 'text-bg-success' : 'text-bg-secondary'">
            {{ chapter.visible ? 'Publié' : 'Brouillon' }}
          </span>
        </td>
        <td>
          <AppLink
            :to="`/anime_manga/chapter/${chapter.id}`"
            class="btn btn-primary"
            aria-label="Modifier le chapitre"
          >
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </AppLink>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="6">
          <em>Aucun chapitre</em>
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
