<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useGendersStore } from '@/stores'
import type { GenderForm } from '@/types/forms/GenderForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  gender: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useGendersStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.gender)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as GenderForm
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.gender.id, form)
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
    id="genderModal"
    title="d'un genre"
    add-other-label="Ajouter un autre genre"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{ name: props.gender?.name ?? '' }"
    :form-key="props.gender?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="genderModal-name">Nom</label>
      <Field name="name" id="genderModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
  </FormModal>
</template>
