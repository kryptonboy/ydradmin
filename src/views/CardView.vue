<script setup lang="ts">
import {
  useCardGroupsStore,
  useCardsStore,
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
import CardModal from './modals/CardModal.vue'
import type { Card } from '@/types/models/Card'
import type { CardSubType } from '@/types/models/CardSubType'
import type { CardType } from '@/types/models/CardType'
import type { CardGroup } from '@/types/models/CardGroup'
import type { MonsterAttribute } from '@/types/models/MonsterAttribute'
import type { MonsterSubType } from '@/types/models/MonsterSubType'
import type { MonsterType } from '@/types/models/MonsterType'
import type { MonsterEffect } from '@/types/models/MonsterEffect'
import type { Sort, Filters } from '@/types/Api'
import type { Tag } from '@/types/models/Tag'
import { getFullyQualifiedCssClass } from '@/helpers/card'
import CardProperties from '@/components/CardProperties.vue'
import AppPaginator from '@/components/AppPaginator.vue'

const cardsStore = useCardsStore()
const cardSubTypesStore = useCardSubTypesStore()
const cardTypesStore = useCardTypesStore()
const cardGroupsStore = useCardGroupsStore()
const monsterAttributesStore = useMonsterAttributesStore()
const monsterSubTypesStore = useMonsterSubTypesStore()
const monsterTypesStore = useMonsterTypesStore()
const monsterEffectsStore = useMonsterEffectsStore()
const tagsStore = useTagsStore()

const { items: cards, loading, pagination } = storeToRefs(cardsStore)

const cardModalRef = ref<InstanceType<typeof CardModal> | null>(null)
const selectedCard = ref<Card | null>(null)

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
  sortBy: 'reference',
  sortDir: 'asc',
})

const filters = reactive({
  name: null as string | null,
  reference: null as string | null,
  description: null as string | null,
  pendulumDescription: null as string | null,
  'abstractCard.cardSubType': [] as CardSubType[],
  'abstractCard.cardSubType.cardType': [] as CardType[],
  'abstractCard.cardGroup': [] as CardGroup[],
  'abstractCard.monsterAttribute': [] as MonsterAttribute[],
  'abstractCard.monsterSubType': [] as MonsterSubType[],
  'abstractCard.monsterType': [] as MonsterType[],
  'abstractCard.monsterEffects': [] as MonsterEffect[],
  'abstractCard.tags': [] as Tag[],
})

function setSort(
  field:
    | 'id'
    | 'name'
    | 'reference'
    | 'abstractCard.cardSubType.name'
    | 'abstractCard.cardSubType.cardType.name'
    | 'abstractCard.cardGroup.name'
    | 'abstractCard.monsterAttribute.name'
    | 'abstractCard.monsterSubType.name'
    | 'abstractCard.monsterType.name',
) {
  if (field === sort.value.sortBy) {
    sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.sortBy = field
    sort.value.sortDir = 'asc'
  }
  filterCards()
}

function getSortIcon() {
  return sort.value.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
}

function resetFilters() {
  filters.name = null
  filters.reference = null
  filters.description = null
  filters.pendulumDescription = null
  filters['abstractCard.cardSubType'] = []
  filters['abstractCard.cardSubType.cardType'] = []
  filters['abstractCard.cardGroup'] = []
  filters['abstractCard.monsterAttribute'] = []
  filters['abstractCard.monsterSubType'] = []
  filters['abstractCard.monsterType'] = []
  filters['abstractCard.monsterEffects'] = []
  filters['abstractCard.tags'] = []
  filterCards()
}

function applyFilters() {
  currentPage.value = 1
  filterCards()
}

function openCardModal(card: Card | null = null) {
  selectedCard.value = card
  if (null !== cardModalRef.value) {
    cardModalRef.value.showModal()
  }
}

function changePage(newPage: number) {
  currentPage.value = newPage
  filterCards()
}

function processFilters(): Filters {
  return {
    name: filters.name,
    reference: filters.reference,
    description: filters.description,
    pendulumDescription: filters.pendulumDescription,
    'abstractCard.cardSubType': filters['abstractCard.cardSubType'].map((cst) => cst.id),
    'abstractCard.cardSubType.cardType': filters['abstractCard.cardSubType.cardType'].map(
      (ct) => ct.id,
    ),
    'abstractCard.cardGroup': filters['abstractCard.cardGroup'].map((cg) => cg.id),
    'abstractCard.monsterAttribute': filters['abstractCard.monsterAttribute'].map((ma) => ma.id),
    'abstractCard.monsterSubType': filters['abstractCard.monsterSubType'].map((mst) => mst.id),
    'abstractCard.monsterType': filters['abstractCard.monsterType'].map((mt) => mt.id),
    'abstractCard.monsterEffects': filters['abstractCard.monsterEffects'].map((me) => me.id),
    'abstractCard.tags': filters['abstractCard.tags'].map((t) => t.id),
  }
}

function filterCards() {
  const processedFilters = processFilters()
  cardsStore.filter(processedFilters, sort.value, currentPage.value)
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

filterCards()
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Cartes</h2>
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
      <button class="btn btn-primary" @click="openCardModal()">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>

  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row">
      <div class="col-3">
        <label for="card_name" class="form-label">Nom</label>
        <input
          type="text"
          class="form-control"
          name="card_name"
          id="card_name"
          placeholder="Filtrer par nom..."
          v-model="filters.name"
        />
      </div>
      <div class="col-3">
        <label for="card_reference" class="form-label">Référence</label>
        <input
          type="text"
          class="form-control"
          name="card_reference"
          id="card_reference"
          placeholder="Filtrer par référence..."
          v-model="filters.reference"
        />
      </div>
      <div class="col-3">
        <label for="card_description" class="form-label">Description</label>
        <input
          type="text"
          class="form-control"
          name="card_description"
          id="card_description"
          placeholder="Filtrer par description..."
          v-model="filters.description"
        />
      </div>
      <div class="col-3">
        <label for="card_pendulum_description" class="form-label">Description Pendulum</label>
        <input
          type="text"
          class="form-control"
          name="card_pendulum_description"
          id="card_pendulum_description"
          placeholder="Filtrer par description pendulum..."
          v-model="filters.pendulumDescription"
        />
      </div>
      <div class="col-3">
        <label for="card_card_sub_type" class="form-label">Sous-Type de carte</label>
        <multi-select
          v-model="filters['abstractCard.cardSubType']"
          :options="cardSubTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par sous-type de carte..."
        />
      </div>
      <div class="col-3">
        <label for="card_card_type" class="form-label">Type de carte</label>
        <multi-select
          v-model="filters['abstractCard.cardSubType.cardType']"
          :options="cardTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par type de carte..."
        />
      </div>
      <div class="col-3">
        <label for="card_card_group" class="form-label">Groupe de cartes</label>
        <multi-select
          v-model="filters['abstractCard.cardGroup']"
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
        <label for="card_monster_attribute" class="form-label">Attribut de monstre</label>
        <multi-select
          v-model="filters['abstractCard.monsterAttribute']"
          :options="monsterAttributes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par attribut de monstre..."
        />
      </div>
      <div class="col-3">
        <label for="card_monster_sub_type" class="form-label">Sous-Type de monstre</label>
        <multi-select
          v-model="filters['abstractCard.monsterSubType']"
          :options="monsterSubTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par sous-type de monstre"
        />
      </div>
      <div class="col-3">
        <label for="card_monster_type" class="form-label">Type de monstre</label>
        <multi-select
          v-model="filters['abstractCard.monsterType']"
          :options="monsterTypes"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par type de monstre..."
        />
      </div>
      <div class="col-3">
        <label for="card_monster_effects" class="form-label">Effet de monstre</label>
        <multi-select
          v-model="filters['abstractCard.monsterEffects']"
          :options="monsterEffects"
          :multiple="true"
          label="name"
          track-by="id"
          placeholder="Filtrer par effet de monstre..."
        />
      </div>
      <div class="col-3">
        <label for="card_tags" class="form-label">Tag</label>
        <multi-select
          v-model="filters['abstractCard.tags']"
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
        <th scope="col" @click="setSort('reference')" role="button">
          Référence
          <font-awesome-icon v-if="sort.sortBy === 'reference'" :icon="getSortIcon()" />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col">Propriétés</th>
        <th scope="col" @click="setSort('abstractCard.cardSubType.name')" role="button">
          Sous-Type de carte
          <font-awesome-icon
            v-if="sort.sortBy === 'abstractCard.cardSubType.name'"
            :icon="getSortIcon()"
          />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('abstractCard.cardSubType.cardType.name')" role="button">
          Type de carte
          <font-awesome-icon
            v-if="sort.sortBy === 'abstractCard.cardSubType.cardType.name'"
            :icon="getSortIcon()"
          />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('abstractCard.cardGroup.name')" role="button">
          Groupe de cartes
          <font-awesome-icon
            v-if="sort.sortBy === 'abstractCard.cardGroup.name'"
            :icon="getSortIcon()"
          />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('abstractCard.monsterAttribute.name')" role="button">
          Attribut de monstre
          <font-awesome-icon
            v-if="sort.sortBy === 'abstractCard.monsterAttribute.name'"
            :icon="getSortIcon()"
          />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('abstractCard.monsterSubType.name')" role="button">
          Sous-Type de monstre
          <font-awesome-icon
            v-if="sort.sortBy === 'abstractCard.monsterSubType.name'"
            :icon="getSortIcon()"
          />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col" @click="setSort('abstractCard.monsterType.name')" role="button">
          Type de monstre
          <font-awesome-icon
            v-if="sort.sortBy === 'abstractCard.monsterType.name'"
            :icon="getSortIcon()"
          />
          <font-awesome-icon v-else :icon="['fa', 'sort']" />
        </th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="11" class="text-center align-middle">
          <div class="spinner-botder spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="cards.length">
      <tr
        v-for="card in cards"
        :key="card.id"
        :class="getFullyQualifiedCssClass(card.abstractCard)"
      >
        <td>{{ card.id }}</td>
        <td>{{ card.name }}</td>
        <td>{{ card.reference }}</td>
        <td>
          <CardProperties :abstract-card="card.abstractCard" />
        </td>
        <td>{{ card.abstractCard.cardSubType.name }}</td>
        <td>{{ card.abstractCard.cardSubType.cardType.name }}</td>
        <td>{{ card.abstractCard.cardGroup?.name }}</td>
        <td>{{ card.abstractCard.monsterAttribute?.name ?? '-' }}</td>
        <td>{{ card.abstractCard.monsterSubType?.name ?? '-' }}</td>
        <td>{{ card.abstractCard.monsterType?.name ?? '-' }}</td>
        <td class="actions">
          <button class="btn btn-primary" @click="openCardModal(card)">
            <font-awesome-icon :icon="['fa', 'pencil']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="11" class="text-center align-middle">
          <em>Aucune carte</em>
        </td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="11" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <CardModal ref="cardModalRef" :card="selectedCard ?? undefined" @card-saved="filterCards" />
</template>
