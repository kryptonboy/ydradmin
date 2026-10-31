<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useExtensionTypesStore } from '@/stores'
import type { ExtensionType } from '@/types/models/ExtensionType'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  extensionType: { type: Object, default: null },
})

const emit = defineEmits(['extensionTypeSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useExtensionTypesStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.extensionType)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  position: yup.number().integer().required('Position requise').min(1),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as ExtensionType
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.extensionType.id, form)
    } else {
      await store.create(form)
    }
  }, setErrors)
  if (!saved) return
  emit('extensionTypeSaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="extensionTypeModal"
    title="d'un type d'extension"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.extensionType?.name ?? '',
      position: props.extensionType?.position ?? 1,
    }"
    :form-key="props.extensionType?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="extensionTypeModal-name">Nom</label>
      <Field name="name" id="extensionTypeModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="extensionTypeModal-position">Position</label>
      <Field name="position" id="extensionTypeModal-position" type="number" class="form-control" />
      <ErrorMessage name="position" class="text-danger small" />
    </div>
  </FormModal>
</template>
