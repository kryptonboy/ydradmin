<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useGradingCompaniesStore } from '@/stores'
import type { GradingCompany } from '@/types/models/GradingCompany'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  gradingCompany: { type: Object, default: null },
})

const emit = defineEmits(['gradingCompanySaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useGradingCompaniesStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.gradingCompany)

const schema = yup.object({
  name: yup.string().max(100, '100 caractères maximum').required('Nom requis'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const gradingCompany = values as unknown as GradingCompany
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.gradingCompany.id, gradingCompany)
    } else {
      await store.create(gradingCompany)
    }
  }, setErrors)
  if (!saved) return
  emit('gradingCompanySaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="gradingCompanyModal"
    title="d'une société de gradation"
    add-other-label="Ajouter une autre société"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.gradingCompany?.name ?? '',
    }"
    :form-key="props.gradingCompany?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="gradingCompanyModal-name">Nom</label>
      <Field name="name" id="gradingCompanyModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
  </FormModal>
</template>
