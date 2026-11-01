<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppearanceEditor from '@/components/content/AppearanceEditor.vue'
import BlockEditor from '@/components/content/BlockEditor.vue'
import UsedCards from '@/components/content/UsedCards.vue'
import FileUploader from '@/components/FileUploader.vue'
import MediaThumb from '@/components/MediaThumb.vue'
import { useBlockContent } from '@/composables/useBlockContent'
import { useSubmit } from '@/composables/useSubmit'
import { getErrorMessage } from '@/helpers/api-error'
import { fromDateInput, toDateInput } from '@/helpers/date'
import { useMoviesStore } from '@/stores'
import type { MovieForm } from '@/types/forms/MovieForm'
import type { Appearance } from '@/types/models/Appearance'
import type { Movie } from '@/types/models/Movie'
import { useForm } from 'vee-validate'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'

const route = useRoute()
const router = useRouter()
const store = useMoviesStore()
const { submitError, submit } = useSubmit()
const content = useBlockContent()

const movieId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => movieId.value !== null)

const movie = ref<Movie | null>(null)
const appearances = ref<Appearance[]>([])
const appearancesVersion = ref(0)
const loading = ref(false)
const loadError = ref<string | null>(null)
const saved = ref(false)
const saving = ref(false)

const coverUploader = useTemplateRef<InstanceType<typeof FileUploader>>('coverUploader')
const titleUploader = useTemplateRef<InstanceType<typeof FileUploader>>('titleUploader')
const coverIri = ref<string | null>(null)
const titleIri = ref<string | null>(null)
const isUploadingCover = ref(false)
const isUploadingTitle = ref(false)

const schema = yup.object({
  title: yup.string().required('Titre requis'),
  synopsis: yup.string().nullable(),
  japaneseName: yup.string().nullable(),
  romanizedJapaneseName: yup.string().nullable(),
  usReleaseDate: yup.string().nullable(),
  japanReleaseDate: yup.string().nullable(),
  europeReleaseDate: yup.string().nullable(),
  visible: yup.boolean().default(true),
  coverImage: yup.string().nullable(),
  titleImage: yup.string().nullable(),
})

const { defineField, errors, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    synopsis: '',
    japaneseName: '',
    romanizedJapaneseName: '',
    usReleaseDate: '',
    japanReleaseDate: '',
    europeReleaseDate: '',
    visible: true,
    coverImage: '',
    titleImage: '',
  },
})

const [title] = defineField('title')
const [synopsis] = defineField('synopsis')
const [japaneseName] = defineField('japaneseName')
const [romanizedJapaneseName] = defineField('romanizedJapaneseName')
const [usReleaseDate] = defineField('usReleaseDate')
const [japanReleaseDate] = defineField('japanReleaseDate')
const [europeReleaseDate] = defineField('europeReleaseDate')
const [visible] = defineField('visible')

function reset() {
  resetForm()
  content.clear()
  movie.value = null
  appearances.value = []
  coverIri.value = null
  titleIri.value = null
  coverUploader.value?.clearFile()
  titleUploader.value?.clearFile()
  submitError.value = null
  saved.value = false
}

async function load() {
  reset()
  loadError.value = null
  if (movieId.value === null) return

  loading.value = true
  try {
    const data = await store.get(movieId.value)
    movie.value = data
    appearances.value = data.characters ?? []
    resetForm({
      values: {
        title: data.title,
        synopsis: data.synopsis ?? '',
        japaneseName: data.japaneseName ?? '',
        romanizedJapaneseName: data.romanizedJapaneseName ?? '',
        usReleaseDate: toDateInput(data.usReleaseDate),
        japanReleaseDate: toDateInput(data.japanReleaseDate),
        europeReleaseDate: toDateInput(data.europeReleaseDate),
        visible: data.visible,
        coverImage: '',
        titleImage: '',
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
  if (movieId.value === null) return
  try {
    appearances.value = (await store.get(movieId.value)).characters ?? []
    appearancesVersion.value += 1
  } catch (err) {
    submitError.value = getErrorMessage(err)
  }
}

const onSubmit = handleSubmit(async (values) => {
  saved.value = false
  content.blockErrors.value = {}
  saving.value = true

  const payload: MovieForm = {
    title: values.title,
    synopsis: values.synopsis || null,
    japaneseName: values.japaneseName || null,
    romanizedJapaneseName: values.romanizedJapaneseName || null,
    usReleaseDate: fromDateInput(values.usReleaseDate),
    japanReleaseDate: fromDateInput(values.japanReleaseDate),
    europeReleaseDate: fromDateInput(values.europeReleaseDate),
    visible: values.visible,
    blocks: content.toPayload(),
  }
  if (coverIri.value) payload.coverImage = coverIri.value
  if (titleIri.value) payload.titleImage = titleIri.value

  let createdId: number | null = null
  const ok = await submit(
    async () => {
      if (movieId.value !== null) {
        await store.update(movieId.value, payload)
      } else {
        createdId = (await store.create(payload)).id
      }
    },
    (violations) => setErrors(content.splitViolations(violations)),
  )
  saving.value = false
  if (!ok) return

  if (createdId !== null) {
    await router.replace(`/anime_manga/movie/${createdId}`)
  } else {
    await load()
  }
  saved.value = true
})

async function remove() {
  if (movieId.value === null) return
  if (!window.confirm('Supprimer définitivement ce film ?')) return
  const ok = await submit(() => store.remove(movieId.value as number))
  if (ok) await router.push('/anime_manga/movie')
}

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
      <h2 class="mb-0">
        {{ isEdit ? "Édition d'un film" : "Création d'un film" }}
        <span v-if="isEdit && movie && !movie.visible" class="badge text-bg-secondary fs-6">
          Brouillon
        </span>
      </h2>
      <div class="d-flex gap-2">
        <AppLink to="/anime_manga/movie" class="btn btn-secondary">
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
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="saving || isUploadingCover || isUploadingTitle"
        >
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
      <div v-if="saved" class="alert alert-success" role="status">Film enregistré.</div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label" for="movie-title">Titre</label>
              <input
                id="movie-title"
                v-model="title"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.title }"
              />
              <div class="invalid-feedback">{{ errors.title }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="movie-japanese-name">Nom japonais</label>
              <input
                id="movie-japanese-name"
                v-model="japaneseName"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="movie-romanized-name">Nom japonais (rōmaji)</label>
              <input
                id="movie-romanized-name"
                v-model="romanizedJapaneseName"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label" for="movie-japan-date">Sortie au Japon</label>
              <input
                id="movie-japan-date"
                v-model="japanReleaseDate"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.japanReleaseDate }"
              />
              <div class="invalid-feedback">{{ errors.japanReleaseDate }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="movie-us-date">Sortie aux États-Unis</label>
              <input
                id="movie-us-date"
                v-model="usReleaseDate"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.usReleaseDate }"
              />
              <div class="invalid-feedback">{{ errors.usReleaseDate }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="movie-europe-date">Sortie en Europe</label>
              <input
                id="movie-europe-date"
                v-model="europeReleaseDate"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.europeReleaseDate }"
              />
              <div class="invalid-feedback">{{ errors.europeReleaseDate }}</div>
            </div>
            <div class="col-md-6">
              <MediaThumb v-if="!coverIri" :media="movie?.coverImage" alt="Jaquette actuelle" />
              <FileUploader
                ref="coverUploader"
                v-model="coverIri"
                v-model:uploading="isUploadingCover"
                label="Jaquette"
                context="movie"
              />
              <div v-if="errors.coverImage" class="text-danger small">{{ errors.coverImage }}</div>
            </div>
            <div class="col-md-6">
              <MediaThumb
                v-if="!titleIri"
                :media="movie?.titleImage"
                alt="Image du titre actuelle"
              />
              <FileUploader
                ref="titleUploader"
                v-model="titleIri"
                v-model:uploading="isUploadingTitle"
                label="Image du titre"
                context="movie"
              />
              <div v-if="errors.titleImage" class="text-danger small">{{ errors.titleImage }}</div>
            </div>
            <div class="col-12">
              <label class="form-label" for="movie-synopsis">Résumé court</label>
              <textarea
                id="movie-synopsis"
                v-model="synopsis"
                rows="3"
                class="form-control"
                :class="{ 'is-invalid': errors.synopsis }"
              ></textarea>
              <div class="invalid-feedback">{{ errors.synopsis }}</div>
              <div class="form-text">
                Texte brut ; le résumé complet est dans le contenu ci-dessous.
              </div>
            </div>
            <div class="col-12">
              <div class="form-check form-switch">
                <input
                  id="movie-visible"
                  v-model="visible"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                />
                <label class="form-check-label" for="movie-visible">
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
          <p v-if="!isEdit || !movie" class="text-muted fst-italic mb-0">
            Enregistrez le film pour y ajouter des personnages.
          </p>
          <div v-else class="row g-4">
            <div class="col-lg-8">
              <AppearanceEditor
                kind="movie"
                :parent-iri="movie['@id']"
                :appearances="appearances"
                @changed="refreshAppearances"
              />
            </div>
            <div class="col-lg-4">
              <strong class="d-block mb-2">Cartes du film</strong>
              <UsedCards resource="movies" :id="movie.id" :version="appearancesVersion" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </form>
</template>
