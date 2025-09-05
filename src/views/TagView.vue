<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTagsStore } from '@/stores'
import { computed, reactive, ref } from 'vue'
import type { Sort } from '@/types/Api'
import * as yup from 'yup'
import TagModal from './modals/TagModal.vue'
import type { Tag } from '@/types/Tag'

const tagsStore = useTagsStore()
const { items: tags, loading } = storeToRefs(tagsStore)

const tagModalRef = ref<InstanceType<typeof TagModal> | null>(null)
const selectedTag = ref<Tag | null>(null)
const showModal = ref(false)

const currentPage = ref<number>(1)

const sort = ref<Sort>({
  sortBy: 'id',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
  description: null as string | null,
  visible: null as boolean | null,
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

function setSort(field: 'id' | 'name') {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilter() {
  filters.name = null
  filters.description = null
  filters.visible = null
  currentPage.value = 1
  filterTags()
}

function filterTags() {
  tagsStore.filter(filters, sort.value, currentPage.value)
}

function openTagModal(tag: Tag | null = null) {
  selectedTag.value = tag
  if (null !== tagModalRef.value) {
    tagModalRef.value.showModal()
  }
}

filterTags()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Tags</h2>
    <div>
      <button
        class="btn btn-secondary me-md-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#filterCollapse"
      >
        <font-awesome-icon :icon="['fa', 'filter']" />
        Filtrer
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
          type="string"
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
          type="string"
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
        <button class="btn btn-secondary w-100" @click="resetFilter()">
          <font-awesome-icon :icon="['fa', 'clock-rotate-left']" />
          Réinitialiser
        </button>
        <button class="btn btn-primary w-100" @click="filterTags()">
          <font-awesome-icon :icon="['fa', 'check']" />
          Valider
        </button>
      </div>
    </div>
  </div>
  <table class="table">
    <thead>
      <tr>
        <th scope="col" @click="setSort('id')" role="button">
          #
          <font-awesome-icon v-if="sort.sortBy === 'id'" :icon="getSortIcon()" />
          <font-awesome-icon v-if="sort.sortBy !== 'id'" :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('name')" role="button">
          Nom
          <font-awesome-icon v-if="sort.sortBy === 'name'" :icon="getSortIcon()" />
          <font-awesome-icon v-if="sort.sortBy !== 'name'" :icon="['fa', 'sort']" />
        </th>
        <th scope="col">Description</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="!loading && tags.length">
      <tr v-for="tag in tags" :key="tag.id">
        <td>{{ tag.id }}</td>
        <td>{{ tag.name }}</td>
        <td>{{ tag.description }}</td>
        <td>
          <button class="btn btn-primary" @click="openTagModal(tag)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-if="!loading && !tags.length">
      <tr>
        <td colspan="4">
          <em>Aucun tag</em>
        </td>
      </tr>
    </tbody>
    <tbody v-if="loading">
      <tr>
        <td colspan="4" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <TagModal ref="tagModalRef" :tag="selectedTag" />
</template>
