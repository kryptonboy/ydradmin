<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import FormModal from '@/components/FormModal.vue'
import MediaThumb from '@/components/MediaThumb.vue'
import { useSubmit } from '@/composables/useSubmit'
import {
  useCountriesStore,
  useExtensionsStore,
  useExtensionTypesStore,
  useGameFormatsStore,
} from '@/stores'
import type { ExtensionForm } from '@/types/forms/ExtensionForm'
import type { Country } from '@/types/models/Country'
import type { Extension } from '@/types/models/Extension'
import type { ExtensionType } from '@/types/models/ExtensionType'
import type { GameFormat } from '@/types/models/GameFormat'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  extension: { type: Object, default: null },
})

const emit = defineEmits(['extensionSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const iconUploader = useTemplateRef<InstanceType<typeof FileUploader>>('iconUploader')
const store = useExtensionsStore()
const countriesStore = useCountriesStore()
const extensionTypesStore = useExtensionTypesStore()
const { submitError, submit } = useSubmit()

const countries = ref<Country[]>([])
const extensionTypes = ref<ExtensionType[]>([])
const gameFormats = ref<GameFormat[]>([])
const iconId = ref<string | null>(null)
const isUploadingIcon = ref(false)
const isEdit = computed(() => !!props.extension)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  reference: yup.string().required('Référence requise'),
  releaseDate: yup.date().nullable(),
  cardsCount: yup.number().required('Nombre de cartes requis'),
  extensionType: yup.object({ id: yup.string().required() }).nullable().required(),
  country: yup.object({ id: yup.string().required() }).nullable().required(),
  gameFormats: yup.array().default([]),
})

function toForm(values: Extension): ExtensionForm {
  return {
    name: values.name,
    reference: values.reference,
    releaseDate: values.releaseDate ? new Date(values.releaseDate).toISOString() : null,
    cardsCount: values.cardsCount,
    extensionType: values.extensionType['@id'],
    country: values.country['@id'],
    // La liste remplace l'existant : [] retire l'extension de tous les formats
    gameFormats: (values.gameFormats ?? []).map((format) => format['@id']),
  }
}

const formatDateForInput = (date: string | Date | undefined | null) => {
  if (!date) return null
  return new Date(date).toISOString().split('T')[0]
}

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload = toForm(values as unknown as Extension)
  if (iconId.value) {
    payload.icon = iconId.value
  }
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.extension.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('extensionSaved')
  modal.value?.finish(isEdit.value)
}

function onReset() {
  submitError.value = null
  iconId.value = null
  iconUploader.value?.clearFile()
}

onMounted(async () => {
  countries.value = await countriesStore.fetchAll()
  extensionTypes.value = await extensionTypesStore.fetchAll()
  gameFormats.value = await useGameFormatsStore().fetchAll()
})

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="extensionModal"
    title="d'une extension"
    add-other-label="Ajouter une autre extension"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.extension?.name ?? '',
      reference: props.extension?.reference ?? '',
      releaseDate: formatDateForInput(props.extension?.releaseDate ?? null),
      cardsCount: props.extension?.cardsCount ?? 0,
      extensionType: props.extension?.extensionType ?? null,
      country: props.extension?.country ?? null,
      gameFormats: props.extension?.gameFormats ?? [],
    }"
    :form-key="props.extension?.id ?? 'new'"
    :submit-error="submitError"
    :disabled="isUploadingIcon"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label" for="extensionModal-name">Nom</label>
      <Field name="name" id="extensionModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="extensionModal-reference">Référence</label>
      <Field name="reference" id="extensionModal-reference" type="text" class="form-control" />
      <ErrorMessage name="reference" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="extensionModal-releaseDate">Date de release</label>
      <Field name="releaseDate" id="extensionModal-releaseDate" type="date" class="form-control" />
      <ErrorMessage name="releaseDate" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="extensionModal-cardsCount">Nombre de cartes</label>
      <Field name="cardsCount" id="extensionModal-cardsCount" type="number" class="form-control" />
      <ErrorMessage name="cardsCount" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="extensionType" v-slot="{ field }">
        <label class="form-label" for="extensionModal-extensionType">Type d'extension</label>
        <multi-select
          id="extensionModal-extensionType"
          v-model="field.value"
          :options="extensionTypes"
          label="name"
          track-by="id"
          placeholder="Choisir un type d'extension"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="extensionType" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="country" v-slot="{ field }">
        <label class="form-label" for="extensionModal-country">Pays</label>
        <multi-select
          id="extensionModal-country"
          v-model="field.value"
          :options="countries"
          label="name"
          track-by="id"
          placeholder="Choisissez un pays"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="country" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="gameFormats" v-slot="{ field }">
        <label class="form-label" for="extensionModal-gameFormats">Formats de jeu</label>
        <multi-select
          id="extensionModal-gameFormats"
          v-model="field.value"
          :options="gameFormats"
          :multiple="true"
          :close-on-select="false"
          label="name"
          track-by="id"
          placeholder="Choisir des formats de jeu"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="gameFormats" class="text-danger small" />
    </div>
    <MediaThumb v-if="!iconId" :media="props.extension?.icon" alt="Icône actuelle" />
    <FileUploader
      ref="iconUploader"
      v-model="iconId"
      v-model:uploading="isUploadingIcon"
      label="Icône"
      context="extension"
    />
  </FormModal>
</template>
