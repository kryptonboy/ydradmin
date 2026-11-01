<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useGameFormatsStore } from '@/stores'
import type { GameFormatForm } from '@/types/forms/GameFormatForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  gameFormat: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useGameFormatsStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.gameFormat)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  description: yup.string().required('Description requise'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as GameFormatForm
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.gameFormat.id, form)
    } else {
      await store.create(form)
    }
  }, setErrors)
  if (!saved) return
  emit('saved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="gameFormatModal"
    title="d'un format de jeu"
    add-other-label="Ajouter un autre format"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.gameFormat?.name ?? '',
      description: props.gameFormat?.description ?? '',
    }"
    :form-key="props.gameFormat?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="gameFormatModal-name">Nom</label>
      <Field name="name" id="gameFormatModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="gameFormatModal-description">Description</label>
      <Field
        name="description"
        id="gameFormatModal-description"
        as="textarea"
        rows="4"
        class="form-control"
      />
      <ErrorMessage name="description" class="text-danger small" />
    </div>
  </FormModal>
</template>
