<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useCountriesStore } from '@/stores'
import type { Country } from '@/types/models/Country'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  country: { type: Object, default: null },
})

const emit = defineEmits(['countrySaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useCountriesStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.country)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  code: yup
    .string()
    .required('Code requis')
    .length(3, 'Le code doit faire exactement 3 caractères'),
  position: yup.number().required('Position requise').min(1),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as Country
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.country.id, form)
    } else {
      await store.create(form)
    }
  }, setErrors)
  if (!saved) return
  emit('countrySaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="countryModal"
    title="d'un pays"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.country?.name ?? '',
      code: props.country?.code ?? '',
      position: props.country?.position ?? 1,
    }"
    :form-key="props.country?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label">Nom</label>
      <Field name="name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label">Code Alpha-3</label>
      <Field name="code" type="text" class="form-control" />
      <ErrorMessage name="code" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label">Position</label>
      <Field name="position" type="number" class="form-control" />
      <ErrorMessage name="position" class="text-danger small" />
    </div>
  </FormModal>
</template>
