<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import FormModal from '@/components/FormModal.vue'
import MediaThumb from '@/components/MediaThumb.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useSmileysStore } from '@/stores'
import type { SmileyForm } from '@/types/forms/SmileyForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  smiley: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const uploader = useTemplateRef<InstanceType<typeof FileUploader>>('uploader')
const store = useSmileysStore()
const { submitError, submit } = useSubmit()

const imageId = ref<string | null>(null)
const isUploading = ref(false)
const isEdit = computed(() => !!props.smiley)

const schema = yup.object({
  code: yup.string().required('Code requis').max(10, '10 caractères maximum'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload: SmileyForm = { code: String(values.code) }
  if (imageId.value) payload.image = imageId.value
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.smiley.id, payload)
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
  imageId.value = null
  uploader.value?.clearFile()
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="smileyModal"
    title="d'un smiley"
    add-other-label="Ajouter un autre smiley"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{ code: props.smiley?.code ?? '' }"
    :form-key="props.smiley?.id ?? 'new'"
    :submit-error="submitError"
    :disabled="isUploading"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label" for="smileyModal-code">Code</label>
      <Field
        name="code"
        id="smileyModal-code"
        type="text"
        class="form-control"
        maxlength="10"
        placeholder=":)"
      />
      <div class="form-text">Texte tapé dans un commentaire pour obtenir l'image.</div>
      <ErrorMessage name="code" class="text-danger small" />
    </div>
    <MediaThumb v-if="!imageId" :media="props.smiley?.image" alt="Image actuelle" />
    <FileUploader
      ref="uploader"
      v-model="imageId"
      v-model:uploading="isUploading"
      label="Image"
      context="smiley"
    />
  </FormModal>
</template>
