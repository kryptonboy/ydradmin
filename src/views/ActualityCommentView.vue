<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { useRemoveAction } from '@/composables/useRemoveAction'
import { getErrorMessage } from '@/helpers/api-error'
import { formatDateTime } from '@/helpers/date'
import { useActualityCommentsStore } from '@/stores'
import type { ActualityComment } from '@/types/models/ActualityComment'
import { ref } from 'vue'
import ActualityCommentModal from './modals/ActualityCommentModal.vue'

const modalRef = ref<InstanceType<typeof ActualityCommentModal> | null>(null)
const selected = ref<ActualityComment | null>(null)
const store = useActualityCommentsStore()
const toggleError = ref<string | null>(null)

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
  sort: { sortBy: 'createdAt', sortDir: 'desc' },
  createFilters: () => ({
    search: null as string | null,
    author: null as string | null,
    hidden: null as string | null,
  }),
})

const { removeError, remove } = useRemoveAction(store, reload)

function openModal(comment: ActualityComment) {
  selected.value = comment
  modalRef.value?.showModal()
}

/** Masque ou ré-affiche un commentaire sans ouvrir la modale */
async function toggleHidden(comment: ActualityComment) {
  toggleError.value = null
  try {
    await store.update(comment.id, { hidden: !comment.hidden })
    await reload()
  } catch (err) {
    toggleError.value = getErrorMessage(err)
  }
}

const excerpt = (text: string) => (text.length > 140 ? `${text.slice(0, 140)}…` : text)
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Commentaires d'actualités</h2>
    <div>
      <button
        class="btn btn-secondary position-relative"
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
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="comment_search" class="form-label">Texte</label>
        <input
          type="text"
          class="form-control"
          id="comment_search"
          placeholder="Rechercher dans le texte..."
          v-model="filters.search"
        />
      </div>
      <div class="col-3">
        <label for="comment_author" class="form-label">Auteur</label>
        <input
          type="text"
          class="form-control"
          id="comment_author"
          placeholder="Filtrer par pseudo..."
          v-model="filters.author"
        />
      </div>
      <div class="col-3">
        <label for="comment_hidden" class="form-label">Visibilité</label>
        <select class="form-select" id="comment_hidden" v-model="filters.hidden">
          <option :value="null">Tous</option>
          <option value="false">Visibles</option>
          <option value="true">Masqués</option>
        </select>
      </div>
      <div class="col-3 d-flex flex-column gap-2">
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
  <div v-if="removeError || toggleError" class="alert alert-danger" role="alert">
    {{ removeError ?? toggleError }}
  </div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <th scope="col">Actualité</th>
        <th scope="col">Auteur</th>
        <th scope="col">Commentaire</th>
        <SortableHeader field="createdAt" :sort="sort" @sort="setSort">Posté le</SortableHeader>
        <th scope="col">Statut</th>
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
    <tbody v-else-if="items.length">
      <tr v-for="comment in items" :key="comment.id" :class="{ 'table-secondary': comment.hidden }">
        <td>{{ comment.id }}</td>
        <td>
          <AppLink v-if="comment.actuality?.id" :to="`/content/actuality/${comment.actuality.id}`">
            {{ comment.actualityTitle }}
          </AppLink>
          <template v-else>{{ comment.actualityTitle }}</template>
        </td>
        <td>{{ comment.author }}</td>
        <td>{{ excerpt(comment.content) }}</td>
        <td>{{ formatDateTime(comment.postedAt) }}</td>
        <td>
          <span class="badge" :class="comment.hidden ? 'bg-secondary' : 'bg-success'">
            {{ comment.hidden ? 'Masqué' : 'Visible' }}
          </span>
        </td>
        <td class="text-nowrap">
          <button class="btn btn-primary" aria-label="Modifier" @click="openModal(comment)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
          <button
            class="btn btn-outline-secondary ms-1"
            :aria-label="comment.hidden ? 'Ré-afficher' : 'Masquer'"
            :title="comment.hidden ? 'Ré-afficher' : 'Masquer'"
            @click="toggleHidden(comment)"
          >
            <font-awesome-icon :icon="['fa', comment.hidden ? 'eye' : 'eye-slash']" />
          </button>
          <button
            class="btn btn-outline-danger ms-1"
            aria-label="Supprimer"
            title="Supprimer"
            @click="remove(comment, `Commentaire de ${comment.author}`)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="7">
          <em>Aucun commentaire</em>
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
  <ActualityCommentModal ref="modalRef" :comment="selected ?? undefined" @saved="reload" />
</template>
