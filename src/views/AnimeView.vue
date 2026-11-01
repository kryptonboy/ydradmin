<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import AppLink from '@/components/AppLink.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { getErrorMessage } from '@/helpers/api-error'
import { formatDate } from '@/helpers/date'
import { useAnimesStore } from '@/stores'
import type { Anime } from '@/types/models/Anime'
import { ref } from 'vue'
import AnimeModal from './modals/AnimeModal.vue'

const modalRef = ref<InstanceType<typeof AnimeModal> | null>(null)
const selected = ref<Anime | null>(null)
const store = useAnimesStore()

const {
  items,
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
} = useListView(store, {
  sort: { sortBy: 'id', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
    search: null as string | null,
  }),
})

const deleteError = ref<string | null>(null)

async function remove(anime: Anime) {
  if (!window.confirm(`Supprimer « ${anime.name} » ?`)) return
  deleteError.value = null
  try {
    await store.remove(anime.id)
    await reload()
  } catch (err) {
    deleteError.value = getErrorMessage(err)
  }
}

function openModal(anime: Anime | null = null) {
  selected.value = anime
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Animés</h2>
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
        <label for="anime_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          id="anime_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="anime_search" class="form-label">Texte de la fiche</label>
        <input
          type="text"
          class="form-control"
          id="anime_search"
          placeholder="Rechercher dans le contenu..."
          v-model="filters.search"
        />
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
  <div v-if="deleteError" class="alert alert-danger" role="alert">{{ deleteError }}</div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <SortableHeader field="name" :sort="sort" @sort="setSort">Nom</SortableHeader>
        <th scope="col">Nom japonais</th>
        <SortableHeader field="japanReleaseDate" :sort="sort" @sort="setSort"
          >Sortie au Japon</SortableHeader
        >
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
    <tbody v-else-if="items.length">
      <tr v-for="anime in items" :key="anime.id">
        <td>{{ anime.id }}</td>
        <td>{{ anime.name }}</td>
        <td>{{ anime.japaneseName }}</td>
        <td>{{ formatDate(anime.japanReleaseDate) }}</td>
        <td>
          <button class="btn btn-primary" aria-label="Modifier" @click="openModal(anime)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <AppLink :to="`/anime_manga/anime/${anime.id}`" class="btn btn-outline-primary ms-1">
            Fiche
          </AppLink>
          <button
            class="btn btn-outline-danger ms-1"
            :disabled="!!(anime.arcs?.length || anime.seasons?.length)"
            :title="
              anime.arcs?.length || anime.seasons?.length
                ? 'Supprimer les saisons et arcs avant de supprimer cet animé'
                : 'Supprimer'
            "
            aria-label="Supprimer"
            @click="remove(anime)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5">
          <em>Aucun animé</em>
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
  <AnimeModal ref="modalRef" :anime="selected ?? undefined" @saved="reload" />
</template>
