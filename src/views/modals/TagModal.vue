<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useTagsStore } from '@/stores'
import type { Tag } from '@/types/models/Tag'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  tag: { type: Object, default: null },
})

const emit = defineEmits(['tagSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useTagsStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.tag)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  description: yup.string().required('Description requise'),
  visible: yup.boolean().default(true),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as Tag
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.tag.id, form)
    } else {
      await store.create(form)
    }
  }, setErrors)
  if (!saved) return
  emit('tagSaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="tagModal"
    title="d'un tag"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.tag?.name ?? '',
      description: props.tag?.description ?? '',
      visible: props.tag?.visible ?? true,
    }"
    :form-key="props.tag?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="tagModal-name">Nom</label>
      <Field name="name" id="tagModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="tagModal-description">Description</label>
      <Field
        name="description"
        id="tagModal-description"
        as="textarea"
        rows="3"
        class="form-control"
      />
      <ErrorMessage name="description" class="text-danger small" />
    </div>
    <div class="form-check">
      <Field
        name="visible"
        type="checkbox"
        class="form-check-input"
        id="tagVisible"
        :value="true"
        :unchecked-value="false"
      />
      <label class="form-check-label" for="tagVisible">Visible</label>
    </div>
  </FormModal>
</template>
