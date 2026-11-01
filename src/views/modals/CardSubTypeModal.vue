<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import FormModal from '@/components/FormModal.vue'
import MediaThumb from '@/components/MediaThumb.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useCardSubTypesStore, useCardTypesStore } from '@/stores'
import type { CardSubTypeForm } from '@/types/forms/CardSubTypeForm'
import type { CardSubType } from '@/types/models/CardSubType'
import type { CardType } from '@/types/models/CardType'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  cardSubType: { type: Object, default: null },
})

const emit = defineEmits(['cardSubTypeSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const iconUploader = useTemplateRef<InstanceType<typeof FileUploader>>('iconUploader')
const store = useCardSubTypesStore()
const cardTypesStore = useCardTypesStore()
const { submitError, submit } = useSubmit()

const iconId = ref<string | null>(null)
const isUploadingIcon = ref(false)
const cardTypes = ref<CardType[]>([])
const isEdit = computed(() => !!props.cardSubType)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  cssClass: yup.string().required('Champ requis'),
  position: yup.number().required('Position requise'),
  cardType: yup.object({ id: yup.string().required() }).nullable().required(),
})

function toForm(values: CardSubType): CardSubTypeForm {
  return {
    name: values.name,
    cssClass: values.cssClass,
    position: values.position,
    cardType: values.cardType['@id'],
  }
}

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload = toForm(values as unknown as CardSubType)
  if (iconId.value) {
    payload.icon = iconId.value
  }

  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.cardSubType.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('cardSubTypeSaved')
  modal.value?.finish(isEdit.value)
}

function onReset() {
  submitError.value = null
  iconId.value = null
  iconUploader.value?.clearFile()
}

onMounted(async () => {
  cardTypes.value = await cardTypesStore.fetchAll()
})

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="cardSubTypeModal"
    title="d'un sous-type de carte"
    add-other-label="Ajouter un autre sous-type"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.cardSubType?.name ?? '',
      cssClass: props.cardSubType?.cssClass ?? '',
      position: props.cardSubType?.position ?? 0,
      cardType: props.cardSubType?.cardType ?? null,
    }"
    :form-key="props.cardSubType?.id ?? 'new'"
    :submit-error="submitError"
    :disabled="isUploadingIcon"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label" for="cardSubTypeModal-name">Nom</label>
      <Field name="name" id="cardSubTypeModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="cardSubTypeModal-cssClass">Classe CSS</label>
      <Field name="cssClass" id="cardSubTypeModal-cssClass" type="text" class="form-control" />
      <ErrorMessage name="cssClass" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="cardSubTypeModal-position">Position</label>
      <Field name="position" id="cardSubTypeModal-position" type="number" class="form-control" />
      <ErrorMessage name="position" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="cardType" v-slot="{ field }">
        <label class="form-label" for="cardSubTypeModal-cardType">Type de carte</label>
        <multi-select
          id="cardSubTypeModal-cardType"
          v-model="field.value"
          :options="cardTypes"
          label="name"
          track-by="id"
          placeholder="Choisir un type de carte"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="cardType" class="text-danger small" />
    </div>
    <MediaThumb v-if="!iconId" :media="props.cardSubType?.icon" alt="Icône actuelle" />
    <FileUploader
      ref="iconUploader"
      v-model="iconId"
      v-model:uploading="isUploadingIcon"
      label="Icône"
      context="card_sub_type"
    />
  </FormModal>
</template>
