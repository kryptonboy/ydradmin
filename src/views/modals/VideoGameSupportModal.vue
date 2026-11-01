<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useVideoGameSupportsStore } from '@/stores'
import type { VideoGameSupportForm } from '@/types/forms/VideoGameSupportForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  support: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useVideoGameSupportsStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.support)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  position: yup.number().typeError('Nombre requis').min(0).required('Position requise'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as VideoGameSupportForm
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.support.id, form)
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
    id="videoGameSupportModal"
    title="d'un support de jeu vidéo"
    add-other-label="Ajouter un autre support"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.support?.name ?? '',
      position: props.support?.position ?? 0,
    }"
    :form-key="props.support?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="videoGameSupportModal-name">Nom</label>
      <Field name="name" id="videoGameSupportModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="videoGameSupportModal-position">Position</label>
      <Field
        name="position"
        id="videoGameSupportModal-position"
        type="number"
        min="0"
        class="form-control"
      />
      <ErrorMessage name="position" class="text-danger small" />
    </div>
  </FormModal>
</template>
