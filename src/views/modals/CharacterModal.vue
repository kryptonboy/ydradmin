<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { fromDateInput, toDateInput } from '@/helpers/date'
import { mediaUrl } from '@/helpers/media'
import { useAstrologicalSignsStore, useCharactersStore, useGendersStore } from '@/stores'
import type { CharacterForm } from '@/types/forms/CharacterForm'
import type { AstrologicalSign } from '@/types/models/AstrologicalSign'
import type { Gender } from '@/types/models/Gender'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  character: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const photoUploader = useTemplateRef<InstanceType<typeof FileUploader>>('photoUploader')
const bannerUploader = useTemplateRef<InstanceType<typeof FileUploader>>('bannerUploader')
const store = useCharactersStore()
const { submitError, submit } = useSubmit()

const genders = ref<Gender[]>([])
const signs = ref<AstrologicalSign[]>([])
const photoId = ref<string | null>(null)
const bannerId = ref<string | null>(null)
const isUploadingPhoto = ref(false)
const isUploadingBanner = ref(false)
const isEdit = computed(() => !!props.character)

const currentPhoto = computed(() => mediaUrl(props.character?.photo?.contentUrl))
const currentBanner = computed(() => mediaUrl(props.character?.banner?.contentUrl))

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  gender: yup.string().required('Genre requis'),
  astrologicalSign: yup.string().nullable(),
  japaneseName: yup.string().nullable(),
  romanizedJapaneseName: yup.string().nullable(),
  description: yup.string().nullable(),
  height: yup.string().nullable(),
  weight: yup.string().nullable(),
  hairColor: yup.string().nullable(),
  eyeColor: yup.string().nullable(),
  birthDate: yup.string().nullable(),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as Record<string, string | null>
  const payload: CharacterForm = {
    name: form.name as string,
    gender: form.gender as string,
    astrologicalSign: form.astrologicalSign || null,
    japaneseName: form.japaneseName || null,
    romanizedJapaneseName: form.romanizedJapaneseName || null,
    description: form.description || null,
    height: form.height || null,
    weight: form.weight || null,
    hairColor: form.hairColor || null,
    eyeColor: form.eyeColor || null,
    birthDate: fromDateInput(form.birthDate),
  }
  if (photoId.value) payload.photo = photoId.value
  if (bannerId.value) payload.banner = bannerId.value

  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.character.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('saved')
  modal.value?.finish(isEdit.value)
}

function onReset() {
  submitError.value = null
  photoId.value = null
  bannerId.value = null
  photoUploader.value?.clearFile()
  bannerUploader.value?.clearFile()
}

onMounted(async () => {
  ;[genders.value, signs.value] = await Promise.all([
    useGendersStore().fetchAll(),
    useAstrologicalSignsStore().fetchAll(),
  ])
})

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="characterModal"
    title="d'un personnage"
    add-other-label="Ajouter un autre personnage"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.character?.name ?? '',
      gender: props.character?.gender?.['@id'] ?? '',
      astrologicalSign: props.character?.astrologicalSign?.['@id'] ?? '',
      japaneseName: props.character?.japaneseName ?? '',
      romanizedJapaneseName: props.character?.romanizedJapaneseName ?? '',
      description: props.character?.description ?? '',
      height: props.character?.height ?? '',
      weight: props.character?.weight ?? '',
      hairColor: props.character?.hairColor ?? '',
      eyeColor: props.character?.eyeColor ?? '',
      birthDate: toDateInput(props.character?.birthDate),
    }"
    :form-key="props.character?.id ?? 'new'"
    :submit-error="submitError"
    :disabled="isUploadingPhoto || isUploadingBanner"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label" for="characterModal-name">Nom</label>
      <Field name="name" id="characterModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label" for="characterModal-japaneseName">Nom japonais</label>
        <Field
          name="japaneseName"
          id="characterModal-japaneseName"
          type="text"
          class="form-control"
        />
        <ErrorMessage name="japaneseName" class="text-danger small" />
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label" for="characterModal-romanizedJapaneseName">
          Nom japonais (rōmaji)
        </label>
        <Field
          name="romanizedJapaneseName"
          id="characterModal-romanizedJapaneseName"
          type="text"
          class="form-control"
        />
        <ErrorMessage name="romanizedJapaneseName" class="text-danger small" />
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label" for="characterModal-gender">Genre</label>
        <Field name="gender" id="characterModal-gender" as="select" class="form-select">
          <option value="">Choisir un genre</option>
          <option v-for="gender in genders" :key="gender.id" :value="gender['@id']">
            {{ gender.name }}
          </option>
        </Field>
        <ErrorMessage name="gender" class="text-danger small" />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label" for="characterModal-astrologicalSign">Signe astrologique</label>
        <Field
          name="astrologicalSign"
          id="characterModal-astrologicalSign"
          as="select"
          class="form-select"
        >
          <option value="">Aucun</option>
          <option v-for="sign in signs" :key="sign.id" :value="sign['@id']">
            {{ sign.name }}
          </option>
        </Field>
        <ErrorMessage name="astrologicalSign" class="text-danger small" />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label" for="characterModal-birthDate">Date de naissance</label>
        <Field name="birthDate" id="characterModal-birthDate" type="date" class="form-control" />
        <ErrorMessage name="birthDate" class="text-danger small" />
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label" for="characterModal-description">Description</label>
      <Field
        name="description"
        id="characterModal-description"
        as="textarea"
        rows="4"
        class="form-control"
      />
      <ErrorMessage name="description" class="text-danger small" />
    </div>
    <div class="row">
      <div class="col-6 col-md-3 mb-3">
        <label class="form-label" for="characterModal-height">Taille</label>
        <Field name="height" id="characterModal-height" type="text" class="form-control" />
        <ErrorMessage name="height" class="text-danger small" />
      </div>
      <div class="col-6 col-md-3 mb-3">
        <label class="form-label" for="characterModal-weight">Poids</label>
        <Field name="weight" id="characterModal-weight" type="text" class="form-control" />
        <ErrorMessage name="weight" class="text-danger small" />
      </div>
      <div class="col-6 col-md-3 mb-3">
        <label class="form-label" for="characterModal-hairColor">Cheveux</label>
        <Field name="hairColor" id="characterModal-hairColor" type="text" class="form-control" />
        <ErrorMessage name="hairColor" class="text-danger small" />
      </div>
      <div class="col-6 col-md-3 mb-3">
        <label class="form-label" for="characterModal-eyeColor">Yeux</label>
        <Field name="eyeColor" id="characterModal-eyeColor" type="text" class="form-control" />
        <ErrorMessage name="eyeColor" class="text-danger small" />
      </div>
    </div>
    <img
      v-if="currentPhoto && !photoId"
      :src="currentPhoto"
      alt="Photo actuelle"
      class="img-thumbnail mb-2 d-block"
      style="max-height: 6rem"
    />
    <FileUploader
      ref="photoUploader"
      v-model="photoId"
      v-model:uploading="isUploadingPhoto"
      label="Photo"
      context="character"
    />
    <img
      v-if="currentBanner && !bannerId"
      :src="currentBanner"
      alt="Bannière actuelle"
      class="img-thumbnail mb-2 d-block"
      style="max-height: 6rem"
    />
    <FileUploader
      ref="bannerUploader"
      v-model="bannerId"
      v-model:uploading="isUploadingBanner"
      label="Bannière"
      context="character"
    />
  </FormModal>
</template>
