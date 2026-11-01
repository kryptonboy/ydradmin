<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { mediaUrl } from '@/helpers/media'
import { useAstrologicalSignsStore, useCharactersStore, useGendersStore } from '@/stores'
import type { Filters } from '@/types/Api'
import type { AstrologicalSign } from '@/types/models/AstrologicalSign'
import type { Character } from '@/types/models/Character'
import type { Gender } from '@/types/models/Gender'
import type { Ref as ModelRef } from '@/types/models/Ref'
import { onMounted, ref } from 'vue'
import CharacterModal from './modals/CharacterModal.vue'

const modalRef = ref<InstanceType<typeof CharacterModal> | null>(null)
const selected = ref<Character | null>(null)
const genders = ref<Gender[]>([])
const signs = ref<AstrologicalSign[]>([])

const {
  items: characters,
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
} = useListView(useCharactersStore(), {
  sort: { sortBy: 'name', sortDir: 'asc' },
  createFilters: () => ({
    name: null as string | null,
    gender: null as number | null,
    astrologicalSign: null as number | null,
  }),
  toQuery: (f): Filters => ({
    name: f.name || null,
    gender: f.gender,
    astrologicalSign: f.astrologicalSign,
  }),
})

onMounted(async () => {
  ;[genders.value, signs.value] = await Promise.all([
    useGendersStore().fetchAll(),
    useAstrologicalSignsStore().fetchAll(),
  ])
})

// L'API ne renvoie que l'identifiant de ces relations : les noms viennent des listes chargées
const genderName = (ref: ModelRef) => genders.value.find((g) => g.id === ref.id)?.name ?? ''
const signName = (ref?: ModelRef | null) =>
  ref ? (signs.value.find((s) => s.id === ref.id)?.name ?? '') : ''

function openModal(character: Character | null = null) {
  selected.value = character
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Personnages</h2>
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
        <label for="character_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          id="character_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="character_gender" class="form-label">Genre</label>
        <select class="form-select" id="character_gender" v-model="filters.gender">
          <option :value="null">Tous</option>
          <option v-for="gender in genders" :key="gender.id" :value="gender.id">
            {{ gender.name }}
          </option>
        </select>
      </div>
      <div class="col-3">
        <label for="character_sign" class="form-label">Signe astrologique</label>
        <select class="form-select" id="character_sign" v-model="filters.astrologicalSign">
          <option :value="null">Tous</option>
          <option v-for="sign in signs" :key="sign.id" :value="sign.id">{{ sign.name }}</option>
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
        <th scope="col">Photo</th>
        <SortableHeader field="name" :sort="sort" @sort="setSort">Nom</SortableHeader>
        <th scope="col">Genre</th>
        <th scope="col">Signe</th>
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
    <tbody v-else-if="characters.length">
      <tr v-for="character in characters" :key="character.id">
        <td>{{ character.id }}</td>
        <td>
          <img
            v-if="mediaUrl(character.photo?.contentUrl)"
            :src="mediaUrl(character.photo?.contentUrl) ?? undefined"
            :alt="`Photo de ${character.name}`"
            class="rounded"
            style="height: 3rem; width: 3rem; object-fit: cover"
          />
        </td>
        <td>{{ character.name }}</td>
        <td>{{ genderName(character.gender) }}</td>
        <td>{{ signName(character.astrologicalSign) }}</td>
        <td>
          <button class="btn btn-primary" aria-label="Modifier" @click="openModal(character)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="6">
          <em>Aucun personnage</em>
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
  <CharacterModal ref="modalRef" :character="selected ?? undefined" @saved="reload" />
</template>
