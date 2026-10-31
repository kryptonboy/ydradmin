<script setup lang="ts">
import {
  useAbstractCardsStore,
  useCardGroupsStore,
  useCardSubTypesStore,
  useCardTypesStore,
  useMonsterAttributesStore,
  useMonsterEffectsStore,
  useMonsterSubTypesStore,
  useMonsterTypesStore,
  useTagsStore,
} from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import AbstractCardModal from './modals/AbstractCardModal.vue'
import type { AbstractCard } from '@/types/models/AbstractCard'
import type { CardSubType } from '@/types/models/CardSubType'
import type { CardType } from '@/types/models/CardType'
import type { CardGroup } from '@/types/models/CardGroup'
import type { MonsterAttribute } from '@/types/models/MonsterAttribute'
import type { MonsterSubType } from '@/types/models/MonsterSubType'
import type { MonsterType } from '@/types/models/MonsterType'
import type { MonsterEffect } from '@/types/models/MonsterEffect'
import type { Tag } from '@/types/models/Tag'
import type { Filters, Sort } from '@/types/Api'
import Paginator from '@/components/Paginator.vue'
import CardProperties from '@/components/CardProperties.vue'
import { getFullyQualifiedCssClass } from '@/helpers/card'

const abstractCardsStore = useAbstractCardsStore()
const cardSubTypesStore = useCardSubTypesStore()
const cardTypesStore = useCardTypesStore()
const cardGroupsStore = useCardGroupsStore()
const monsterAttributesStore = useMonsterAttributesStore()
const monsterSubTypesStore = useMonsterSubTypesStore()
const monsterTypesStore = useMonsterTypesStore()
const monsterEffectsStore = useMonsterEffectsStore()
const tagsStore = useTagsStore()

const { items: abstractCards, loading, pagination } = storeToRefs(abstractCardsStore)

const abstractCardModalRef = ref<InstanceType<typeof AbstractCardModal> | null>(null)
const selectedAbstractCard = ref<AbstractCard | null>(null)

const currentPage = ref<number>(1)
const cardSubTypes = ref<CardSubType[]>([])
const cardTypes = ref<CardType[]>([])
const cardGroups = ref<CardGroup[]>([])
const monsterAttributes = ref<MonsterAttribute[]>([])
const monsterSubTypes = ref<MonsterSubType[]>([])
const monsterTypes = ref<MonsterType[]>([])
const monsterEffects = ref<MonsterEffect[]>([])
const tags = ref<Tag[]>([])

const cardGroupLoading = ref(false)
const tagLoading = ref(false)

async function fetchCardGroups(query: string) {
  if (!query) {
    cardGroups.value = []
    return
  }

  cardGroupLoading.value = true
  try {
    cardGroups.value = await cardGroupsStore.autocomplete(query)
  } finally {
    cardGroupLoading.value = false
  }
}

async function fetchTags(query: string) {
  if (!query) {
    tags.value = []
    return
  }

  tagLoading.value = true
  try {
    tags.value = await tagsStore.autocomplete(query)
  } finally {
    tagLoading.value = false
  }
}

const sort = ref<Sort>({
  sortBy: 'name',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
  cardSubType: [] as CardSubType[],
  'cardSubType.cardType': [] as CardType[],
  cardGroup: [] as CardGroup[],
  monsterAttribute: [] as MonsterAttribute[],
  monsterSubType: [] as MonsterSubType[],
  monsterType: [] as MonsterType[],
  monsterEffects: [] as MonsterEffect[],
  tags: [] as Tag[],
})

function setSort(
  field:
    | 'id'
    | 'name'
    | 'cardSubType.name'
    | 'cardSubType.cardType.name'
    | 'cardGroup.name'
    | 'monsterAttribute.name'
    | 'monsterSubType.name'
    | 'monsterType.name',
) {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
  filterAbstractCards()
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilters() {
  filters.name = null
  filters.cardSubType = []
  filters['cardSubType.cardType'] = []
  filters.cardGroup = []
  filters.monsterAttribute = []
  filters.monsterSubType = []
  filters.monsterType = []
  filters.monsterEffects = []
  filters.tags = []
  currentPage.value = 1
  filterAbstractCards()
}

function applyFilters() {
  currentPage.value = 1
  filterAbstractCards()
}

function openAbstractCardModal(abstractCard: AbstractCard | null = null) {
  selectedAbstractCard.value = abstractCard
  if (null !== abstractCardModalRef.value) {
    abstractCardModalRef.value.showModal()
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage
  filterAbstractCards()
}

function processFilters(): Filters {
  return {
    name: filters.name,
    cardSubType: filters.cardSubType.map((cst) => cst.id),
    'cardSubType.cardType': filters['cardSubType.cardType'].map((ct) => ct.id),
    cardGroup: filters.cardGroup.map((cg) => cg.id),
    monsterAttribute: filters.monsterAttribute.map((ma) => ma.id),
    monsterSubType: filters.monsterSubType.map((mst) => mst.id),
    monsterType: filters.monsterType.map((mt) => mt.id),
    monsterEffects: filters.monsterEffects.map((me) => me.id),
    tags: filters.tags.map((t) => t.id),
  }
}

function filterAbstractCards() {
  const processedFilters = processFilters()
  abstractCardsStore.filter(processedFilters, sort.value, currentPage.value)
}

const nbFilters = computed(() => {
  let nbFilters = 0

  for (const filterValue of Object.values(filters)) {
    if (Array.isArray(filterValue)) {
      if (filterValue.length > 0) {
        nbFilters++
      }
      continue
    }
    if (null !== filterValue) nbFilters++
  }

  return nbFilters
})

onMounted(async () => {
  cardSubTypes.value = await cardSubTypesStore.fetchAll()
  cardTypes.value = await cardTypesStore.fetchAll()
  monsterAttributes.value = await monsterAttributesStore.fetchAll()
  monsterSubTypes.value = await monsterSubTypesStore.fetchAll()
  monsterTypes.value = await monsterTypesStore.fetchAll()
  monsterEffects.value = await monsterEffectsStore.fetchAll()
})

filterAbstractCards()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Cartes abstraites</h2>
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
      <button class="btn btn-primary" @click="openAbstractCardModal()">
        <font-zwesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="abstract_card_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="abstract_card_name"
          id="abstract_card_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="abstract_card_card_sub_type" class="form-label">Sous-Type de carte</label>
        <multi-select
          v-model="filters.cardSubType"
          :options="cardSubTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par sous-type de carte..."
        />
      </div>
      <div class="col-3">
        <label for="abstract_card_card_type" class="form-label">Type de carte</label>
        <multi-select
          v-model="filters['cardSubType.cardType']"
          :options="cardTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par type de carte..."
        />
      </div>
      <div class="col-3">
        <label for="abstract_card_card_group" class="form-label">Groupe de cartes</label>
        <multi-select
          v-model="filters.cardGroup"
          :options="cardGroups"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par groupe de cartes..."
          :searchable="true"
          :internal-search="false"
          :close-on-select="false"
          :loading="cardGroupLoading"
          @search-change="fetchCardGroups"
        />
      </div>
      <div class="col-3">
        <label for="abstract_card_monster_attribute" class="form-label">Attribut de monstre</label>
        <multi-select
          v-model="filters.monsterAttribute"
          :options="monsterAttributes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par attribut de monstre..."
        />
      </div>
      <div class="col-3">
        <label for="abstract_card_monster_sub_type" class="form-label">Sous-Type de monstre</label>
        <multi-select
          v-model="filters.monsterSubType"
          :options="monsterSubTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par sous-type de monstre..."
        />
      </div>
      <div class="col-3">
        <label for="abstract_card_monster_type" class="form-label">Type de monstre</label>
        <multi-select
          v-model="filters.monsterType"
          :options="monsterTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par type de monstre..."
        />
      </div>
      <div class="col-3">
        <label for="abstract_card_monster_effects" class="form-label">Effet de monstre</label>
        <multi-select
          v-model="filters.monsterEffects"
          :options="monsterEffects"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par effet de monstre..."
        />
      </div>
      <div class="col-3">
        <label for="abstract_card_tags" class="form-label">Tag</label>
        <multi-select
          v-model="filters.tags"
          :options="tags"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par tag..."
          :searchable="true"
          :internal-search="false"
          :close-on-select="false"
          :loading="tagLoading"
          @search-change="fetchTags"
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
  <table class="table">
    <thead>
      <tr>
        <th scope="col" @click="setSort('id')" role="button">
          #
          <font-awesome-icon v-if="sort.sortBy === 'id'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('name')" role="button">
          Nom
          <font-awesome-icon v-if="sort.sortBy === 'name'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col">Propriétés</th>
        <th scope="col" @click="setSort('cardSubType.name')" role="button">
          Sous-Type de carte
          <font-awesome-icon v-if="sort.sortBy === 'cardSubType.name'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('cardSubType.cardType.name')" role="button">
          Type de carte
          <font-awesome-icon
            v-if="sort.sortBy === 'cardSubType.cardType.name'"
            :icon="getSortIcon()"
          />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('cardGroup.name')" role="button">
          Groupe de cartes
          <font-awesome-icon v-if="sort.sortBy === 'cardGroup.name'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('monsterAttribute.name')" role="button">
          Attribut de monstre
          <font-awesome-icon v-if="sort.sortBy === 'monsterAttribute.name'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('monsterSubType.name')" role="button">
          Sous-Type de monstre
          <font-awesome-icon v-if="sort.sortBy === 'monsterSubType.name'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('monsterType.name')" role="button">
          Type de monstre
          <font-awesome-icon v-if="sort.sortBy === 'monsterType.name'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="10" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="abstractCards.length">
      <tr
        v-for="abstractCard in abstractCards"
        :key="abstractCard.id"
        :class="getFullyQualifiedCssClass(abstractCard)"
      >
        <td>{{ abstractCard.id }}</td>
        <td>{{ abstractCard.name }}</td>
        <td>
          <CardProperties :abstract-card="abstractCard" />
        </td>
        <td>{{ abstractCard.cardSubType.name }}</td>
        <td>{{ abstractCard.cardSubType.cardType.name }}</td>
        <td>{{ abstractCard.cardGroup?.name }}</td>
        <td>{{ abstractCard.monsterAttribute?.name ?? '-' }}</td>
        <td>{{ abstractCard.monsterSubType?.name ?? '-' }}</td>
        <td>{{ abstractCard.monsterType?.name ?? '-' }}</td>
        <td class="actions">
          <button class="btn btn-primary" @click="openAbstractCardModal(abstractCard)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="10" class="text-center align-middle">
          <em>Aucune carte abstraite</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="10" class="text-center pt-3 pb-0">
          <Paginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <AbstractCardModal
    ref="abstractCardModalRef"
    :abstract-card="selectedAbstractCard"
    @abstract-card-saved="filterAbstractCards"
  />
</template>
