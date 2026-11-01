<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppearanceEditor from '@/components/content/AppearanceEditor.vue'
import BlockEditor from '@/components/content/BlockEditor.vue'
import UsedCards from '@/components/content/UsedCards.vue'
import { useBlockContent } from '@/composables/useBlockContent'
import { useSubmit } from '@/composables/useSubmit'
import { getErrorMessage } from '@/helpers/api-error'
import { useAnimesStore, useArcSeasonsStore, useEpisodesStore } from '@/stores'
import type { EpisodeForm } from '@/types/forms/EpisodeForm'
import type { Anime } from '@/types/models/Anime'
import type { Appearance } from '@/types/models/Appearance'
import type { Episode } from '@/types/models/Episode'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'

const route = useRoute()
const router = useRouter()
const store = useEpisodesStore()
const animesStore = useAnimesStore()
const arcSeasonsStore = useArcSeasonsStore()
const { submitError, submit } = useSubmit()
const content = useBlockContent()

const episodeId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => episodeId.value !== null)

const episode = ref<Episode | null>(null)
const appearances = ref<Appearance[]>([])
const appearancesVersion = ref(0)
const animes = ref<Anime[]>([])
const animeId = ref<number | ''>('')
const loading = ref(false)
const loadError = ref<string | null>(null)
const saved = ref(false)
const saving = ref(false)

// Un épisode appartient à un lien arc/saison de son animé
const arcSeasonOptions = computed(() =>
  arcSeasonsStore.items.map((link) => ({
    iri: link['@id'],
    label: `${link.arc.name} — saison ${link.season.seasonNumber ?? `#${link.season.id}`}`,
  })),
)

const schema = yup.object({
  title: yup.string().required('Titre requis'),
  episodeNumber: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .nullable(),
  synopsis: yup.string().nullable(),
  japaneseTitle: yup.string().nullable(),
  romanizedJapaneseTitle: yup.string().nullable(),
  visible: yup.boolean().default(true),
  arcSeason: yup.string().required('Arc / saison requis'),
})

const { defineField, errors, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    episodeNumber: null as number | null,
    synopsis: '',
    japaneseTitle: '',
    romanizedJapaneseTitle: '',
    visible: true,
    arcSeason: '',
  },
})

const [title] = defineField('title')
const [episodeNumber] = defineField('episodeNumber')
const [synopsis] = defineField('synopsis')
const [japaneseTitle] = defineField('japaneseTitle')
const [romanizedJapaneseTitle] = defineField('romanizedJapaneseTitle')
const [visible] = defineField('visible')
const [arcSeason] = defineField('arcSeason')

async function loadStructure(id: number | '') {
  if (id === '') {
    arcSeasonsStore.items = []
    return
  }
  const filters = { anime: id }
  const sort = { sortBy: 'id', sortDir: 'asc' as const }
  await Promise.all([arcSeasonsStore.filter(filters, sort, 1)])
}

async function onAnimeChange() {
  arcSeason.value = ''
  await loadStructure(animeId.value)
}

function reset() {
  resetForm()
  content.clear()
  episode.value = null
  appearances.value = []
  animeId.value = ''
  submitError.value = null
  saved.value = false
}

async function load() {
  reset()
  loadError.value = null
  if (episodeId.value === null) return

  loading.value = true
  try {
    const data = await store.get(episodeId.value)
    episode.value = data
    appearances.value = data.characters ?? []
    animeId.value = data.anime?.id ?? ''
    await loadStructure(animeId.value)
    resetForm({
      values: {
        title: data.title,
        episodeNumber: data.episodeNumber ?? null,
        synopsis: data.synopsis ?? '',
        japaneseTitle: data.japaneseTitle ?? '',
        romanizedJapaneseTitle: data.romanizedJapaneseTitle ?? '',
        visible: data.visible,
        arcSeason: data.arcSeason['@id'],
      },
    })
    content.load(data.blocks, data.media)
  } catch (err) {
    loadError.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

/** Recharge uniquement les personnages (le formulaire et les blocs en cours d'édition sont conservés). */
async function refreshAppearances() {
  if (episodeId.value === null) return
  try {
    appearances.value = (await store.get(episodeId.value)).characters ?? []
    appearancesVersion.value += 1
  } catch (err) {
    submitError.value = getErrorMessage(err)
  }
}

const onSubmit = handleSubmit(async (values) => {
  saved.value = false
  content.blockErrors.value = {}
  saving.value = true

  const payload: EpisodeForm = {
    title: values.title,
    episodeNumber: values.episodeNumber ?? null,
    synopsis: values.synopsis || null,
    japaneseTitle: values.japaneseTitle || null,
    romanizedJapaneseTitle: values.romanizedJapaneseTitle || null,
    visible: values.visible,
    arcSeason: values.arcSeason,
    blocks: content.toPayload(),
  }

  let createdId: number | null = null
  const ok = await submit(
    async () => {
      if (episodeId.value !== null) {
        await store.update(episodeId.value, payload)
      } else {
        createdId = (await store.create(payload)).id
      }
    },
    (violations) => setErrors(content.splitViolations(violations)),
  )
  saving.value = false
  if (!ok) return

  if (createdId !== null) {
    await router.replace(`/anime_manga/episode/${createdId}`)
  } else {
    await load()
  }
  saved.value = true
})

async function remove() {
  if (episodeId.value === null) return
  if (!window.confirm('Supprimer définitivement cet épisode ?')) return
  const ok = await submit(() => store.remove(episodeId.value as number))
  if (ok) await router.push('/anime_manga/episode')
}

onMounted(async () => {
  animes.value = await animesStore.fetchAll()
})

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
      <h2 class="mb-0">
        {{ isEdit ? "Édition d'un épisode" : "Création d'un épisode" }}
        <span v-if="isEdit && episode && !episode.visible" class="badge text-bg-secondary fs-6">
          Brouillon
        </span>
      </h2>
      <div class="d-flex gap-2">
        <AppLink to="/anime_manga/episode" class="btn btn-secondary">
          <font-awesome-icon :icon="['fa', 'xmark']" />
          Retour à la liste
        </AppLink>
        <button
          v-if="isEdit"
          type="button"
          class="btn btn-outline-danger"
          :disabled="saving"
          @click="remove"
        >
          <font-awesome-icon :icon="['fa', 'trash']" />
          Supprimer
        </button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <font-awesome-icon
            :icon="saving ? ['fas', 'spinner'] : ['fa', 'floppy-disk']"
            :spin="saving"
          />
          Enregistrer
        </button>
      </div>
    </div>

    <div v-if="loadError" class="alert alert-danger" role="alert">{{ loadError }}</div>
    <div v-else-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    <template v-else>
      <div v-if="submitError" class="alert alert-danger" role="alert">
        {{ submitError }}
        <span v-if="content.blockErrorCount.value">
          — {{ content.blockErrorCount.value }} erreur(s) dans le contenu, repérées en rouge.
        </span>
      </div>
      <div v-if="saved" class="alert alert-success" role="status">Épisode enregistré.</div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-2">
              <label class="form-label" for="episode-number">Numéro</label>
              <input
                id="episode-number"
                v-model.number="episodeNumber"
                type="number"
                min="0"
                class="form-control"
                :class="{ 'is-invalid': errors.episodeNumber }"
              />
              <div class="invalid-feedback">{{ errors.episodeNumber }}</div>
            </div>
            <div class="col-md-10">
              <label class="form-label" for="episode-title">Titre</label>
              <input
                id="episode-title"
                v-model="title"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.title }"
              />
              <div class="invalid-feedback">{{ errors.title }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="episode-japanese-title">Titre japonais</label>
              <input
                id="episode-japanese-title"
                v-model="japaneseTitle"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="episode-romanized-title"
                >Titre japonais (rōmaji)</label
              >
              <input
                id="episode-romanized-title"
                v-model="romanizedJapaneseTitle"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label" for="episode-anime">Animé</label>
              <select
                id="episode-anime"
                v-model="animeId"
                class="form-select"
                @change="onAnimeChange"
              >
                <option value="">Choisir un animé</option>
                <option v-for="anime in animes" :key="anime.id" :value="anime.id">
                  {{ anime.name }}
                </option>
              </select>
            </div>
            <div class="col-md-8">
              <label class="form-label" for="episode-arc-season">Arc / saison</label>
              <select
                id="episode-arc-season"
                v-model="arcSeason"
                class="form-select"
                :class="{ 'is-invalid': errors.arcSeason }"
                :disabled="animeId === ''"
              >
                <option value="">Choisir un arc et une saison</option>
                <option v-for="option in arcSeasonOptions" :key="option.iri" :value="option.iri">
                  {{ option.label }}
                </option>
              </select>
              <div class="invalid-feedback">{{ errors.arcSeason }}</div>
              <div v-if="animeId !== '' && !arcSeasonOptions.length" class="form-text">
                Cet animé n'a aucun lien arc / saison : créez-le depuis sa page « Structure ».
              </div>
            </div>
            <div class="col-12">
              <label class="form-label" for="episode-synopsis">Résumé court</label>
              <textarea
                id="episode-synopsis"
                v-model="synopsis"
                rows="3"
                class="form-control"
              ></textarea>
              <div class="form-text">
                Texte brut ; le résumé complet est dans le contenu ci-dessous.
              </div>
            </div>
            <div class="col-12">
              <div class="form-check form-switch">
                <input
                  id="episode-visible"
                  v-model="visible"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                />
                <label class="form-check-label" for="episode-visible">
                  Publié (décoché : brouillon visible des administrateurs uniquement)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between">
          <strong>Résumé complet</strong>
          <span class="text-muted small">{{ content.blockCount.value }} bloc(s)</span>
        </div>
        <div class="card-body">
          <BlockEditor v-model="content.blocks.value" path="blocks" />
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header"><strong>Personnages et cartes</strong></div>
        <div class="card-body">
          <p v-if="!isEdit || !episode" class="text-muted fst-italic mb-0">
            Enregistrez l'épisode pour y ajouter des personnages.
          </p>
          <div v-else class="row g-4">
            <div class="col-lg-8">
              <AppearanceEditor
                kind="episode"
                :parent-iri="episode['@id']"
                :appearances="appearances"
                @changed="refreshAppearances"
              />
            </div>
            <div class="col-lg-4">
              <strong class="d-block mb-2">Cartes de l'épisode</strong>
              <UsedCards resource="episodes" :id="episode.id" :version="appearancesVersion" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </form>
</template>
