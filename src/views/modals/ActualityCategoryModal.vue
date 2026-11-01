<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useActualityCategoriesStore } from '@/stores'
import type { ActualityCategoryForm } from '@/types/forms/ActualityCategoryForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  category: { type: Object, default: null },
})

const emit = defineEmits(['categorySaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useActualityCategoriesStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.category)

const schema = yup.object({
  label: yup.string().required('Libellé requis'),
  active: yup.boolean().default(true),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as ActualityCategoryForm
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.category.id, form)
    } else {
      await store.create(form)
    }
  }, setErrors)
  if (!saved) return
  emit('categorySaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="actualityCategoryModal"
    title="d'une catégorie d'actualités"
    add-other-label="Ajouter une autre catégorie"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      label: props.category?.label ?? '',
      active: props.category?.active ?? true,
    }"
    :form-key="props.category?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="actualityCategoryModal-label">Libellé</label>
      <Field name="label" id="actualityCategoryModal-label" type="text" class="form-control" />
      <ErrorMessage name="label" class="text-danger small" />
    </div>
    <div class="form-check">
      <Field
        name="active"
        type="checkbox"
        class="form-check-input"
        id="actualityCategoryActive"
        :value="true"
        :unchecked-value="false"
      />
      <label class="form-check-label" for="actualityCategoryActive">Active</label>
    </div>
  </FormModal>
</template>
