<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import AppearanceEditor from '@/components/content/AppearanceEditor.vue'
import BlockEditor from '@/components/content/BlockEditor.vue'
import UsedCards from '@/components/content/UsedCards.vue'
import { useBlockContent } from '@/composables/useBlockContent'
import { useSubmit } from '@/composables/useSubmit'
import { getErrorMessage } from '@/helpers/api-error'
import { useChaptersStore, useMangasStore } from '@/stores'
import type { ChapterForm } from '@/types/forms/ChapterForm'
import type { Appearance } from '@/types/models/Appearance'
import type { Chapter } from '@/types/models/Chapter'
import type { Manga } from '@/types/models/Manga'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'

const route = useRoute()
const router = useRouter()
const store = useChaptersStore()
const mangasStore = useMangasStore()
const { submitError, submit } = useSubmit()
const content = useBlockContent()

const chapterId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => chapterId.value !== null)

const chapter = ref<Chapter | null>(null)
const appearances = ref<Appearance[]>([])
const appearancesVersion = ref(0)
const mangas = ref<Manga[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const saved = ref(false)
const saving = ref(false)

const schema = yup.object({
  title: yup.string().required('Titre requis'),
  chapterNumber: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .nullable(),
  shortSummary: yup.string().nullable(),
  japaneseTitle: yup.string().nullable(),
  romanizedJapaneseTitle: yup.string().nullable(),
  visible: yup.boolean().default(true),
  manga: yup.string().required('Manga requis'),
})

const { defineField, errors, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    chapterNumber: null as number | null,
    shortSummary: '',
    japaneseTitle: '',
    romanizedJapaneseTitle: '',
    visible: true,
    manga: '',
  },
})

const [title] = defineField('title')
const [chapterNumber] = defineField('chapterNumber')
const [shortSummary] = defineField('shortSummary')
const [japaneseTitle] = defineField('japaneseTitle')
const [romanizedJapaneseTitle] = defineField('romanizedJapaneseTitle')
const [visible] = defineField('visible')
const [manga] = defineField('manga')

function reset() {
  resetForm()
  content.clear()
  chapter.value = null
  appearances.value = []
  submitError.value = null
  saved.value = false
}

async function load() {
  reset()
  loadError.value = null
  if (chapterId.value === null) return

  loading.value = true
  try {
    const data = await store.get(chapterId.value)
    chapter.value = data
    appearances.value = data.characters ?? []
    resetForm({
      values: {
        title: data.title,
        chapterNumber: data.chapterNumber ?? null,
        shortSummary: data.shortSummary ?? '',
        japaneseTitle: data.japaneseTitle ?? '',
        romanizedJapaneseTitle: data.romanizedJapaneseTitle ?? '',
        visible: data.visible,
        manga: data.manga['@id'],
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
  if (chapterId.value === null) return
  try {
    appearances.value = (await store.get(chapterId.value)).characters ?? []
    appearancesVersion.value += 1
  } catch (err) {
    submitError.value = getErrorMessage(err)
  }
}

const onSubmit = handleSubmit(async (values) => {
  saved.value = false
  content.blockErrors.value = {}
  saving.value = true

  const payload: ChapterForm = {
    title: values.title,
    chapterNumber: values.chapterNumber ?? null,
    shortSummary: values.shortSummary || null,
    japaneseTitle: values.japaneseTitle || null,
    romanizedJapaneseTitle: values.romanizedJapaneseTitle || null,
    visible: values.visible,
    manga: values.manga,
    blocks: content.toPayload(),
  }

  let createdId: number | null = null
  const ok = await submit(
    async () => {
      if (chapterId.value !== null) {
        await store.update(chapterId.value, payload)
      } else {
        createdId = (await store.create(payload)).id
      }
    },
    (violations) => setErrors(content.splitViolations(violations)),
  )
  saving.value = false
  if (!ok) return

  if (createdId !== null) {
    await router.replace(`/anime_manga/chapter/${createdId}`)
  } else {
    await load()
  }
  saved.value = true
})

async function remove() {
  if (chapterId.value === null) return
  if (!window.confirm('Supprimer définitivement ce chapitre ?')) return
  const ok = await submit(() => store.remove(chapterId.value as number))
  if (ok) await router.push('/anime_manga/chapter')
}

onMounted(async () => {
  mangas.value = await mangasStore.fetchAll()
})

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
      <h2 class="mb-0">
        {{ isEdit ? "Édition d'un chapitre" : "Création d'un chapitre" }}
        <span v-if="isEdit && chapter && !chapter.visible" class="badge text-bg-secondary fs-6">
          Brouillon
        </span>
      </h2>
      <div class="d-flex gap-2">
        <AppLink to="/anime_manga/chapter" class="btn btn-secondary">
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
      <div v-if="saved" class="alert alert-success" role="status">Chapitre enregistré.</div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-2">
              <label class="form-label" for="chapter-number">Numéro</label>
              <input
                id="chapter-number"
                v-model.number="chapterNumber"
                type="number"
                min="0"
                class="form-control"
                :class="{ 'is-invalid': errors.chapterNumber }"
              />
              <div class="invalid-feedback">{{ errors.chapterNumber }}</div>
            </div>
            <div class="col-md-10">
              <label class="form-label" for="chapter-title">Titre</label>
              <input
                id="chapter-title"
                v-model="title"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.title }"
              />
              <div class="invalid-feedback">{{ errors.title }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="chapter-japanese-title">Titre japonais</label>
              <input
                id="chapter-japanese-title"
                v-model="japaneseTitle"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="chapter-romanized-title"
                >Titre japonais (rōmaji)</label
              >
              <input
                id="chapter-romanized-title"
                v-model="romanizedJapaneseTitle"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="chapter-manga">Manga</label>
              <select
                id="chapter-manga"
                v-model="manga"
                class="form-select"
                :class="{ 'is-invalid': errors.manga }"
              >
                <option value="">Choisir un manga</option>
                <option v-for="item in mangas" :key="item.id" :value="item['@id']">
                  {{ item.name }}
                </option>
              </select>
              <div class="invalid-feedback">{{ errors.manga }}</div>
            </div>
            <div class="col-12">
              <label class="form-label" for="chapter-summary">Résumé court</label>
              <textarea
                id="chapter-summary"
                v-model="shortSummary"
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
                  id="chapter-visible"
                  v-model="visible"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                />
                <label class="form-check-label" for="chapter-visible">
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
          <p v-if="!isEdit || !chapter" class="text-muted fst-italic mb-0">
            Enregistrez le chapitre pour y ajouter des personnages.
          </p>
          <div v-else class="row g-4">
            <div class="col-lg-8">
              <AppearanceEditor
                kind="chapter"
                :parent-iri="chapter['@id']"
                :appearances="appearances"
                @changed="refreshAppearances"
              />
            </div>
            <div class="col-lg-4">
              <strong class="d-block mb-2">Cartes du chapitre</strong>
              <UsedCards resource="chapters" :id="chapter.id" :version="appearancesVersion" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </form>
</template>
