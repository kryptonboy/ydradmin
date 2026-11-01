<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import BlockEditor from '@/components/content/BlockEditor.vue'
import CharacterLinks from '@/components/content/CharacterLinks.vue'
import { useBlockContent } from '@/composables/useBlockContent'
import { useSubmit } from '@/composables/useSubmit'
import { getErrorMessage } from '@/helpers/api-error'
import { useVideoGamesStore, useVideoGameSupportsStore } from '@/stores'
import type { VideoGameForm } from '@/types/forms/VideoGameForm'
import type { Appearance } from '@/types/models/Appearance'
import type { VideoGame } from '@/types/models/VideoGame'
import type { VideoGameSupport } from '@/types/models/VideoGameSupport'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'

const route = useRoute()
const router = useRouter()
const store = useVideoGamesStore()
const supportsStore = useVideoGameSupportsStore()
const { submitError, submit } = useSubmit()
const content = useBlockContent()

const gameId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => gameId.value !== null)

const game = ref<VideoGame | null>(null)
const appearances = ref<Appearance[]>([])
const supports = ref<VideoGameSupport[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const saved = ref(false)
const saving = ref(false)

const schema = yup.object({
  title: yup.string().required('Titre requis'),
  summary: yup.string().nullable(),
  visible: yup.boolean().default(true),
  videoGameSupport: yup.string().required('Support requis'),
})

const { defineField, errors, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    summary: '',
    visible: true,
    videoGameSupport: '',
  },
})

const [title] = defineField('title')
const [summary] = defineField('summary')
const [visible] = defineField('visible')
const [videoGameSupport] = defineField('videoGameSupport')

function reset() {
  resetForm()
  content.clear()
  game.value = null
  appearances.value = []
  submitError.value = null
  saved.value = false
}

async function load() {
  reset()
  loadError.value = null
  if (gameId.value === null) return

  loading.value = true
  try {
    const data = await store.get(gameId.value)
    game.value = data
    appearances.value = data.characters ?? []
    resetForm({
      values: {
        title: data.title,
        summary: data.summary ?? '',
        visible: data.visible,
        videoGameSupport: data.videoGameSupport['@id'],
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
  if (gameId.value === null) return
  try {
    appearances.value = (await store.get(gameId.value)).characters ?? []
  } catch (err) {
    submitError.value = getErrorMessage(err)
  }
}

const onSubmit = handleSubmit(async (values) => {
  saved.value = false
  content.blockErrors.value = {}
  saving.value = true

  const payload: VideoGameForm = {
    title: values.title,
    summary: values.summary || null,
    visible: values.visible,
    videoGameSupport: values.videoGameSupport,
    blocks: content.toPayload(),
  }

  let createdId: number | null = null
  const ok = await submit(
    async () => {
      if (gameId.value !== null) {
        await store.update(gameId.value, payload)
      } else {
        createdId = (await store.create(payload)).id
      }
    },
    (violations) => setErrors(content.splitViolations(violations)),
  )
  saving.value = false
  if (!ok) return

  if (createdId !== null) {
    await router.replace(`/video_game/game/${createdId}`)
  } else {
    await load()
  }
  saved.value = true
})

async function remove() {
  if (gameId.value === null) return
  if (!window.confirm('Supprimer définitivement ce jeu vidéo ?')) return
  const ok = await submit(() => store.remove(gameId.value as number))
  if (ok) await router.push('/video_game/game')
}

onMounted(async () => {
  supports.value = await supportsStore.fetchAll()
})

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
      <h2 class="mb-0">
        {{ isEdit ? "Édition d'un jeu vidéo" : "Création d'un jeu vidéo" }}
        <span v-if="isEdit && game && !game.visible" class="badge text-bg-secondary fs-6">
          Brouillon
        </span>
      </h2>
      <div class="d-flex gap-2">
        <AppLink to="/video_game/game" class="btn btn-secondary">
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
      <div v-if="saved" class="alert alert-success" role="status">Jeu vidéo enregistré.</div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-8">
              <label class="form-label" for="game-title">Titre</label>
              <input
                id="game-title"
                v-model="title"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.title }"
              />
              <div class="invalid-feedback">{{ errors.title }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="game-support">Support</label>
              <select
                id="game-support"
                v-model="videoGameSupport"
                class="form-select"
                :class="{ 'is-invalid': errors.videoGameSupport }"
              >
                <option value="">Choisir un support</option>
                <option v-for="support in supports" :key="support.id" :value="support['@id']">
                  {{ support.name }}
                </option>
              </select>
              <div class="invalid-feedback">{{ errors.videoGameSupport }}</div>
            </div>
            <div class="col-12">
              <label class="form-label" for="game-summary">Résumé court</label>
              <textarea
                id="game-summary"
                v-model="summary"
                rows="3"
                class="form-control"
                :class="{ 'is-invalid': errors.summary }"
              ></textarea>
              <div class="invalid-feedback">{{ errors.summary }}</div>
              <div class="form-text">
                Texte brut ; la présentation et le test sont dans le contenu ci-dessous.
              </div>
            </div>
            <div class="col-12">
              <div class="form-check form-switch">
                <input
                  id="game-visible"
                  v-model="visible"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                />
                <label class="form-check-label" for="game-visible">
                  Publié (décoché : brouillon visible des administrateurs uniquement)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between">
          <strong>Présentation et test</strong>
          <span class="text-muted small">{{ content.blockCount.value }} bloc(s)</span>
        </div>
        <div class="card-body">
          <BlockEditor v-model="content.blocks.value" path="blocks" />
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header"><strong>Personnages</strong></div>
        <div class="card-body">
          <p v-if="!isEdit || !game" class="text-muted fst-italic mb-0">
            Enregistrez le jeu pour y ajouter des personnages.
          </p>
          <CharacterLinks
            v-else
            :parent-iri="game['@id']"
            :appearances="appearances"
            @changed="refreshAppearances"
          />
        </div>
      </div>
    </template>
  </form>
</template>
