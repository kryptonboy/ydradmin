<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import BlockEditor from '@/components/content/BlockEditor.vue'
import { blockErrorsKey, mediaMapKey } from '@/components/content/injection'
import FileUploader from '@/components/FileUploader.vue'
import { useSubmit } from '@/composables/useSubmit'
import { getErrorMessage } from '@/helpers/api-error'
import { countBlocks, toApiBlocks, toEditorBlocks } from '@/helpers/content-blocks'
import { fromDatetimeLocal, toDatetimeLocal } from '@/helpers/date'
import { mediaUrl } from '@/helpers/media'
import { useActualitiesStore, useActualityCategoriesStore } from '@/stores'
import type { EditorBlock, MediaMap } from '@/types/content-blocks'
import type { ActualityForm } from '@/types/forms/ActualityForm'
import type { Actuality } from '@/types/models/Actuality'
import type { ActualityCategory } from '@/types/models/ActualityCategory'
import { useForm } from 'vee-validate'
import { computed, onMounted, provide, reactive, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'

const route = useRoute()
const router = useRouter()
const store = useActualitiesStore()
const categoriesStore = useActualityCategoriesStore()
const { submitError, submit } = useSubmit()

const actualityId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => actualityId.value !== null)

const categories = ref<ActualityCategory[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const saved = ref(false)
const saving = ref(false)

// État de l'éditeur de contenu, partagé avec les blocs
const blocks = ref<EditorBlock[]>([])
const mediaMap = reactive<MediaMap>({})
const blockErrors = ref<Record<string, string>>({})
provide(mediaMapKey, mediaMap)
provide(blockErrorsKey, blockErrors)

const imageUploader = useTemplateRef<InstanceType<typeof FileUploader>>('imageUploader')
const imageIri = ref<string | null>(null)
const isUploadingImage = ref(false)
const currentImageUrl = ref<string | null>(null)

const schema = yup.object({
  title: yup.string().required('Titre requis'),
  headnote: yup.string().required('Chapô requis'),
  commentable: yup.boolean().default(true),
  visible: yup.boolean().default(true),
  publishedAt: yup.string().nullable(),
  actualityCategory: yup.string().nullable(),
  image: yup.string().nullable(),
})

const { defineField, errors, handleSubmit, resetForm, setErrors } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    headnote: '',
    commentable: true,
    visible: true,
    publishedAt: '',
    actualityCategory: '',
    image: '',
  },
})

const [title] = defineField('title')
const [headnote] = defineField('headnote')
const [commentable] = defineField('commentable')
const [visible] = defineField('visible')
const [publishedAt] = defineField('publishedAt')
const [actualityCategory] = defineField('actualityCategory')

const blockCount = computed(() => countBlocks(blocks.value))
const blockErrorCount = computed(() => Object.keys(blockErrors.value).length)

function reset() {
  resetForm()
  blocks.value = []
  Object.keys(mediaMap).forEach((key) => delete mediaMap[Number(key)])
  imageIri.value = null
  currentImageUrl.value = null
  imageUploader.value?.clearFile()
  blockErrors.value = {}
  submitError.value = null
  saved.value = false
}

async function load() {
  reset()
  loadError.value = null
  if (actualityId.value === null) return

  loading.value = true
  try {
    const actuality: Actuality = await store.get(actualityId.value)
    resetForm({
      values: {
        title: actuality.title,
        headnote: actuality.headnote,
        commentable: actuality.commentable,
        visible: actuality.visible,
        publishedAt: toDatetimeLocal(actuality.publishedAt),
        actualityCategory: actuality.actualityCategory?.['@id'] ?? '',
      },
    })
    Object.assign(mediaMap, actuality.media ?? {})
    blocks.value = toEditorBlocks(actuality.blocks)
    currentImageUrl.value = mediaUrl(actuality.image?.contentUrl)
  } catch (err) {
    loadError.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

/** Sépare les violations des champs de celles du contenu (`blocks[2].children[0].content`). */
function dispatchViolations(violations: Record<string, string>) {
  const fields: Record<string, string> = {}
  const content: Record<string, string> = {}
  for (const [path, message] of Object.entries(violations)) {
    if (path === 'blocks' || path.startsWith('blocks[') || path.startsWith('blocks.')) {
      content[path] = message
    } else {
      fields[path] = message
    }
  }
  blockErrors.value = content
  setErrors(fields)
}

const onSubmit = handleSubmit(async (values) => {
  saved.value = false
  blockErrors.value = {}
  saving.value = true

  const payload: ActualityForm = {
    title: values.title,
    headnote: values.headnote,
    commentable: values.commentable,
    visible: values.visible,
    publishedAt: fromDatetimeLocal(values.publishedAt),
    actualityCategory: values.actualityCategory || null,
    blocks: toApiBlocks(blocks.value),
  }
  if (imageIri.value) payload.image = imageIri.value

  let createdId: number | null = null
  const ok = await submit(async () => {
    if (actualityId.value !== null) {
      await store.update(actualityId.value, payload)
    } else {
      createdId = (await store.create(payload)).id
    }
  }, dispatchViolations)
  saving.value = false
  if (!ok) return

  if (createdId !== null) {
    await router.replace(`/content/actuality/${createdId}`)
  } else {
    await load()
  }
  saved.value = true
})

async function remove() {
  if (actualityId.value === null) return
  if (!window.confirm('Supprimer définitivement cette actualité ?')) return
  const ok = await submit(() => store.remove(actualityId.value as number))
  if (ok) await router.push('/content/actuality')
}

onMounted(async () => {
  categories.value = await categoriesStore.fetchAll()
})

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
      <h2 class="mb-0">{{ isEdit ? "Édition d'une actualité" : "Création d'une actualité" }}</h2>
      <div class="d-flex gap-2">
        <AppLink to="/content/actuality" class="btn btn-secondary">
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
        <button type="submit" class="btn btn-primary" :disabled="saving || isUploadingImage">
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
        <span v-if="blockErrorCount">
          — {{ blockErrorCount }} erreur(s) dans le contenu, repérées en rouge.
        </span>
      </div>
      <div v-if="saved" class="alert alert-success" role="status">Actualité enregistrée.</div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-8">
              <label class="form-label" for="actuality-title">Titre</label>
              <input
                id="actuality-title"
                v-model="title"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.title }"
              />
              <div class="invalid-feedback">{{ errors.title }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label" for="actuality-category">Catégorie</label>
              <select
                id="actuality-category"
                v-model="actualityCategory"
                class="form-select"
                :class="{ 'is-invalid': errors.actualityCategory }"
              >
                <option value="">Aucune</option>
                <option v-for="category in categories" :key="category.id" :value="category['@id']">
                  {{ category.label }}
                </option>
              </select>
              <div class="invalid-feedback">{{ errors.actualityCategory }}</div>
            </div>
            <div class="col-12">
              <label class="form-label" for="actuality-headnote">Chapô</label>
              <textarea
                id="actuality-headnote"
                v-model="headnote"
                rows="3"
                class="form-control"
                :class="{ 'is-invalid': errors.headnote }"
              ></textarea>
              <div class="invalid-feedback">{{ errors.headnote }}</div>
            </div>
            <div class="col-md-6">
              <img
                v-if="currentImageUrl && !imageIri"
                :src="currentImageUrl"
                alt="Image actuelle"
                class="img-thumbnail mb-2 d-block"
                style="max-height: 6rem"
              />
              <FileUploader
                ref="imageUploader"
                v-model="imageIri"
                v-model:uploading="isUploadingImage"
                label="Image de couverture"
                context="actuality"
              />
              <div v-if="errors.image" class="text-danger small">{{ errors.image }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="actuality-published-at">Date de publication</label>
              <input
                id="actuality-published-at"
                v-model="publishedAt"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.publishedAt }"
              />
              <div class="form-text">
                Vide : publiée dès qu'elle est visible. Dans le futur : planifiée.
              </div>
              <div class="invalid-feedback">{{ errors.publishedAt }}</div>
              <div class="mt-3 d-flex gap-4">
                <div class="form-check form-switch">
                  <input
                    id="actuality-visible"
                    v-model="visible"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                  />
                  <label class="form-check-label" for="actuality-visible">Visible</label>
                </div>
                <div class="form-check form-switch">
                  <input
                    id="actuality-commentable"
                    v-model="commentable"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                  />
                  <label class="form-check-label" for="actuality-commentable">Commentable</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between">
          <strong>Contenu</strong>
          <span class="text-muted small">{{ blockCount }} bloc(s)</span>
        </div>
        <div class="card-body">
          <BlockEditor v-model="blocks" path="blocks" />
        </div>
      </div>
    </template>
  </form>
</template>
