<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import BooleanToIcon from '@/components/BooleanToIcon.vue'
import { useListView } from '@/composables/useListView'
import { useTagsStore } from '@/stores'
import type { Tag } from '@/types/models/Tag'
import { computed, ref } from 'vue'
import TagModal from './modals/TagModal.vue'

const tagModalRef = ref<InstanceType<typeof TagModal> | null>(null)
const selectedTag = ref<Tag | null>(null)

const {
  items: tags,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload: filterTags,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(useTagsStore(), {
  sort: { sortBy: 'id', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
    description: null as string | null,
    visible: null as boolean | null,
  }),
})

const visibleFilter = computed({
  get() {
    if (filters.visible === true) return '1'
    if (filters.visible === false) return '2'
    return ''
  },
  set(value) {
    if (value === '1') filters.visible = true
    else if (value === '2') filters.visible = false
    else filters.visible = null
  },
})

function openTagModal(tag: Tag | null = null) {
  selectedTag.value = tag
  if (null !== tagModalRef.value) {
    tagModalRef.value.showModal()
  }
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Tags</h2>
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
      <button class="btn btn-primary" @click="openTagModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="tag_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="tag_name"
          id="tag_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="tag_description" class="form-label">Description</label>
        <input
          type="text"
          class="form-control"
          name="tag_description"
          id="tag_description"
          placeholder="Filtrer par description..."
          v-model="filters.description"
        />
      </div>
      <div class="col-3">
        <label for="tag_visible" class="form-label">Visible</label>
        <select class="form-select" id="tag_visible" v-model="visibleFilter">
          <option value="">Indifférent</option>
          <option value="1">Oui</option>
          <option value="2">Non</option>
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
        <SortableHeader field="name" :sort="sort" @sort="setSort">Nom</SortableHeader>
        <th scope="col">Description</th>
        <th scope="col">Visible</th>
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
    <tbody v-else-if="tags.length">
      <tr v-for="tag in tags" :key="tag.id">
        <td>{{ tag.id }}</td>
        <td>{{ tag.name }}</td>
        <td>{{ tag.description }}</td>
        <td><BooleanToIcon :field="tag.visible" /></td>
        <td>
          <button class="btn btn-primary" @click="openTagModal(tag)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="5">
          <em>Aucun tag</em>
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
  <TagModal ref="tagModalRef" :tag="selectedTag ?? undefined" @tag-saved="filterTags" />
</template>
