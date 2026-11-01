<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import { getErrorMessage } from '@/helpers/api-error'
import { useAnimesStore, useArcSeasonsStore, useArcsStore, useSeasonsStore } from '@/stores'
import type { Anime } from '@/types/models/Anime'
import type { Arc } from '@/types/models/Arc'
import type { ArcSeason } from '@/types/models/ArcSeason'
import type { NamedRef, SeasonRef } from '@/types/models/Ref'
import type { Season } from '@/types/models/Season'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ArcModal from './modals/ArcModal.vue'
import SeasonModal from './modals/SeasonModal.vue'

const route = useRoute()
const animesStore = useAnimesStore()
const seasonsStore = useSeasonsStore()
const arcsStore = useArcsStore()
const arcSeasonsStore = useArcSeasonsStore()

const animeId = computed(() => Number(route.params.id))
const anime = ref<Anime | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)

const seasons = computed(() => seasonsStore.items)
const arcs = computed(() => arcsStore.items)
const links = computed(() => arcSeasonsStore.items)

const seasonModal = ref<InstanceType<typeof SeasonModal> | null>(null)
const arcModal = ref<InstanceType<typeof ArcModal> | null>(null)
const selectedSeason = ref<Season | null>(null)
const selectedArc = ref<Arc | null>(null)

const newLinkArc = ref('')
const newLinkSeason = ref('')

async function loadStructure() {
  const filters = { anime: animeId.value }
  await Promise.all([
    seasonsStore.filter(filters, { sortBy: 'seasonNumber', sortDir: 'asc' }, 1),
    arcsStore.filter(filters, { sortBy: 'position', sortDir: 'asc' }, 1),
    arcSeasonsStore.filter(filters, { sortBy: 'id', sortDir: 'asc' }, 1),
  ])
}

async function load() {
  loading.value = true
  loadError.value = null
  actionError.value = null
  try {
    anime.value = await animesStore.get(animeId.value)
    await loadStructure()
  } catch (err) {
    loadError.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

const seasonLabel = (ref: SeasonRef) => `Saison ${ref.seasonNumber ?? `#${ref.id}`}`
const arcLabel = (ref: NamedRef) => ref.name

const isSeasonLinked = (season: Season) => links.value.some((l) => l.season.id === season.id)
const isArcLinked = (arc: Arc) => links.value.some((l) => l.arc.id === arc.id)

function openSeason(season: Season | null = null) {
  selectedSeason.value = season
  seasonModal.value?.showModal()
}

function openArc(arc: Arc | null = null) {
  selectedArc.value = arc
  arcModal.value?.showModal()
}

async function run(action: () => Promise<unknown>) {
  actionError.value = null
  try {
    await action()
    await loadStructure()
    anime.value = await animesStore.get(animeId.value)
  } catch (err) {
    actionError.value = getErrorMessage(err)
  }
}

function removeSeason(season: Season) {
  if (!window.confirm(`Supprimer la saison ${season.seasonNumber} ?`)) return
  return run(() => seasonsStore.remove(season.id))
}

function removeArc(arc: Arc) {
  if (!window.confirm(`Supprimer l'arc « ${arc.name} » ?`)) return
  return run(() => arcsStore.remove(arc.id))
}

function removeLink(link: ArcSeason) {
  if (
    !window.confirm(`Supprimer le lien « ${arcLabel(link.arc)} / ${seasonLabel(link.season)} » ?`)
  )
    return
  return run(() => arcSeasonsStore.remove(link.id))
}

async function addLink() {
  if (!newLinkArc.value || !newLinkSeason.value) return
  await run(() => arcSeasonsStore.create({ arc: newLinkArc.value, season: newLinkSeason.value }))
  if (!actionError.value) {
    newLinkArc.value = ''
    newLinkSeason.value = ''
  }
}

watch(animeId, load, { immediate: true })
</script>

<template>
  <div class="d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
    <h2 class="mb-0">Structure de l'animé{{ anime ? ` « ${anime.name} »` : '' }}</h2>
    <AppLink to="/anime_manga/anime" class="btn btn-secondary">
      <font-awesome-icon :icon="['fa', 'xmark']" />
      Retour à la liste
    </AppLink>
  </div>

  <div v-if="loadError" class="alert alert-danger" role="alert">{{ loadError }}</div>
  <div v-else-if="loading && !anime" class="text-center py-5">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
  </div>
  <template v-else-if="anime">
    <div v-if="actionError" class="alert alert-danger" role="alert">{{ actionError }}</div>

    <section class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>Saisons</strong>
        <button class="btn btn-primary btn-sm" @click="openSeason()">
          <font-awesome-icon :icon="['fa', 'plus']" />
          Ajouter une saison
        </button>
      </div>
      <table class="table mb-0">
        <thead>
          <tr>
            <th scope="col">Saison</th>
            <th scope="col">Synopsis</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody v-if="seasons.length">
          <tr v-for="season in seasons" :key="season.id">
            <td>{{ season.seasonNumber }}</td>
            <td class="text-truncate" style="max-width: 32rem">{{ season.synopsis }}</td>
            <td>
              <button
                class="btn btn-primary btn-sm"
                aria-label="Modifier la saison"
                @click="openSeason(season)"
              >
                <font-awesome-icon :icon="['fa', 'pencil']" />
              </button>
              <button
                class="btn btn-outline-danger btn-sm ms-1"
                :disabled="isSeasonLinked(season)"
                :title="
                  isSeasonLinked(season)
                    ? 'Supprimer les liens arc/saison avant de supprimer cette saison'
                    : 'Supprimer'
                "
                aria-label="Supprimer la saison"
                @click="removeSeason(season)"
              >
                <font-awesome-icon :icon="['fa', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="3"><em>Aucune saison</em></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>Arcs</strong>
        <button class="btn btn-primary btn-sm" @click="openArc()">
          <font-awesome-icon :icon="['fa', 'plus']" />
          Ajouter un arc
        </button>
      </div>
      <table class="table mb-0">
        <thead>
          <tr>
            <th scope="col">Position</th>
            <th scope="col">Nom</th>
            <th scope="col">Synopsis</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody v-if="arcs.length">
          <tr v-for="arc in arcs" :key="arc.id">
            <td>{{ arc.position }}</td>
            <td>{{ arc.name }}</td>
            <td class="text-truncate" style="max-width: 32rem">{{ arc.synopsis }}</td>
            <td>
              <button
                class="btn btn-primary btn-sm"
                aria-label="Modifier l'arc"
                @click="openArc(arc)"
              >
                <font-awesome-icon :icon="['fa', 'pencil']" />
              </button>
              <button
                class="btn btn-outline-danger btn-sm ms-1"
                :disabled="isArcLinked(arc)"
                :title="
                  isArcLinked(arc)
                    ? 'Supprimer les liens arc/saison avant de supprimer cet arc'
                    : 'Supprimer'
                "
                aria-label="Supprimer l'arc"
                @click="removeArc(arc)"
              >
                <font-awesome-icon :icon="['fa', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="4"><em>Aucun arc</em></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card mb-4">
      <div class="card-header">
        <strong>Arcs par saison</strong>
        <span class="text-muted small ms-2">Un épisode appartient à un lien arc / saison.</span>
      </div>
      <table class="table mb-0">
        <thead>
          <tr>
            <th scope="col">Arc</th>
            <th scope="col">Saison</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody v-if="links.length">
          <tr v-for="link in links" :key="link.id">
            <td>{{ arcLabel(link.arc) }}</td>
            <td>{{ seasonLabel(link.season) }}</td>
            <td>
              <button
                class="btn btn-outline-danger btn-sm"
                aria-label="Supprimer le lien"
                @click="removeLink(link)"
              >
                <font-awesome-icon :icon="['fa', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="3"><em>Aucun lien</em></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
              <label class="visually-hidden" for="newLinkArc">Arc</label>
              <select id="newLinkArc" v-model="newLinkArc" class="form-select">
                <option value="">Choisir un arc</option>
                <option v-for="arc in arcs" :key="arc.id" :value="arc['@id']">
                  {{ arc.name }}
                </option>
              </select>
            </td>
            <td>
              <label class="visually-hidden" for="newLinkSeason">Saison</label>
              <select id="newLinkSeason" v-model="newLinkSeason" class="form-select">
                <option value="">Choisir une saison</option>
                <option v-for="season in seasons" :key="season.id" :value="season['@id']">
                  Saison {{ season.seasonNumber }}
                </option>
              </select>
            </td>
            <td>
              <button
                class="btn btn-primary"
                :disabled="!newLinkArc || !newLinkSeason"
                @click="addLink"
              >
                <font-awesome-icon :icon="['fa', 'plus']" />
                Lier
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>

    <SeasonModal
      ref="seasonModal"
      :season="selectedSeason ?? undefined"
      :anime-iri="anime['@id']"
      @saved="run(async () => undefined)"
    />
    <ArcModal
      ref="arcModal"
      :arc="selectedArc ?? undefined"
      :anime-iri="anime['@id']"
      @saved="run(async () => undefined)"
    />
  </template>
</template>
