<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import FormModal from '@/components/FormModal.vue'
import MediaThumb from '@/components/MediaThumb.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useAstrologicalSignsStore } from '@/stores'
import type { AstrologicalSignForm } from '@/types/forms/AstrologicalSignForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  sign: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const iconUploader = useTemplateRef<InstanceType<typeof FileUploader>>('iconUploader')
const store = useAstrologicalSignsStore()
const { submitError, submit } = useSubmit()

const iconId = ref<string | null>(null)
const isUploadingIcon = ref(false)
const isEdit = computed(() => !!props.sign)

const month = yup.number().typeError('Nombre requis').min(1).max(12).required('Mois requis')
const day = yup.number().typeError('Nombre requis').min(1).max(31).required('Jour requis')

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  startMonth: month,
  startDay: day,
  endMonth: month,
  endDay: day,
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload = { ...values } as unknown as AstrologicalSignForm
  if (iconId.value) {
    payload.icon = iconId.value
  }

  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.sign.id, payload)
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
  iconId.value = null
  iconUploader.value?.clearFile()
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="astrologicalSignModal"
    title="d'un signe astrologique"
    add-other-label="Ajouter un autre signe"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.sign?.name ?? '',
      startMonth: props.sign?.startMonth ?? 1,
      startDay: props.sign?.startDay ?? 1,
      endMonth: props.sign?.endMonth ?? 1,
      endDay: props.sign?.endDay ?? 1,
    }"
    :form-key="props.sign?.id ?? 'new'"
    :submit-error="submitError"
    :disabled="isUploadingIcon"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label" for="astrologicalSignModal-name">Nom</label>
      <Field name="name" id="astrologicalSignModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="row mb-3">
      <div class="col-6">
        <label class="form-label" for="astrologicalSignModal-startDay">Début : jour</label>
        <Field
          name="startDay"
          id="astrologicalSignModal-startDay"
          type="number"
          min="1"
          max="31"
          class="form-control"
        />
        <ErrorMessage name="startDay" class="text-danger small" />
      </div>
      <div class="col-6">
        <label class="form-label" for="astrologicalSignModal-startMonth">Début : mois</label>
        <Field
          name="startMonth"
          id="astrologicalSignModal-startMonth"
          type="number"
          min="1"
          max="12"
          class="form-control"
        />
        <ErrorMessage name="startMonth" class="text-danger small" />
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-6">
        <label class="form-label" for="astrologicalSignModal-endDay">Fin : jour</label>
        <Field
          name="endDay"
          id="astrologicalSignModal-endDay"
          type="number"
          min="1"
          max="31"
          class="form-control"
        />
        <ErrorMessage name="endDay" class="text-danger small" />
      </div>
      <div class="col-6">
        <label class="form-label" for="astrologicalSignModal-endMonth">Fin : mois</label>
        <Field
          name="endMonth"
          id="astrologicalSignModal-endMonth"
          type="number"
          min="1"
          max="12"
          class="form-control"
        />
        <ErrorMessage name="endMonth" class="text-danger small" />
      </div>
    </div>
    <MediaThumb v-if="!iconId" :media="props.sign?.icon" alt="Icône actuelle" />
    <FileUploader
      ref="iconUploader"
      v-model="iconId"
      v-model:uploading="isUploadingIcon"
      label="Icône"
      context="astrological_sign"
    />
  </FormModal>
</template>
