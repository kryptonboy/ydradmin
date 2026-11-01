<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import FormModal from '@/components/FormModal.vue'
import MediaThumb from '@/components/MediaThumb.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useCardTypesStore } from '@/stores'
import type { CardTypeForm } from '@/types/forms/CardTypeForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  cardType: { type: Object, default: null },
})

const emit = defineEmits(['cardTypeSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const iconUploader = useTemplateRef<InstanceType<typeof FileUploader>>('iconUploader')
const store = useCardTypesStore()
const { submitError, submit } = useSubmit()

const iconId = ref<string | null>(null)
const isUploadingIcon = ref(false)
const isEdit = computed(() => !!props.cardType)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  position: yup.number().required('Position requise'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload = { ...values } as unknown as CardTypeForm
  if (iconId.value) {
    payload.icon = iconId.value
  }

  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.cardType.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('cardTypeSaved')
  modal.value?.finish(isEdit.value)
}

function onReset() {
  submitError.value = null
  iconId.value = null
  iconUploader.value?.clearFile()
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="cardTypeModal"
    title="d'un type de carte"
    add-other-label="Ajouter un autre type"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.cardType?.name ?? '',
      position: props.cardType?.position ?? 0,
    }"
    :form-key="props.cardType?.id ?? 'new'"
    :submit-error="submitError"
    :disabled="isUploadingIcon"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label" for="cardTypeModal-name">Nom</label>
      <Field name="name" id="cardTypeModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="cardTypeModal-position">Position</label>
      <Field name="position" id="cardTypeModal-position" type="number" class="form-control" />
      <ErrorMessage name="position" class="text-danger small" />
    </div>
    <MediaThumb v-if="!iconId" :media="props.cardType?.icon" alt="Icône actuelle" />
    <FileUploader
      ref="iconUploader"
      v-model="iconId"
      v-model:uploading="isUploadingIcon"
      label="Icône"
      context="card_type"
    />
  </FormModal>
</template>
