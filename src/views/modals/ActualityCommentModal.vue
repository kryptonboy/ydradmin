<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useActualityCommentsStore } from '@/stores'
import type { ActualityCommentForm } from '@/types/forms/ActualityCommentForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  comment: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useActualityCommentsStore()
const { submitError, submit } = useSubmit()

const schema = yup.object({
  content: yup.string().trim().required('Contenu requis'),
  hidden: yup.boolean().default(false),
})

// Pas de création : l'API ne permet que de modérer un commentaire existant
const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  if (!props.comment) return
  const payload: ActualityCommentForm = {
    content: String(values.content),
    hidden: Boolean(values.hidden),
  }
  const saved = await submit(() => store.update(props.comment.id, payload), setErrors)
  if (!saved) return
  emit('saved')
  modal.value?.finish(true)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="actualityCommentModal"
    title="d'un commentaire"
    :is-edit="true"
    :schema="schema"
    :initial-values="{
      content: props.comment?.content ?? '',
      hidden: props.comment?.hidden ?? false,
    }"
    :form-key="props.comment?.id ?? 'none'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <p v-if="props.comment" class="text-muted small">
      Par <strong>{{ props.comment.author }}</strong> sur « {{ props.comment.actualityTitle }} »
    </p>
    <div class="mb-3">
      <label class="form-label" for="actualityCommentModal-content">Contenu</label>
      <Field
        as="textarea"
        name="content"
        id="actualityCommentModal-content"
        class="form-control"
        rows="5"
      />
      <ErrorMessage name="content" class="text-danger small" />
    </div>
    <div class="form-check mb-3">
      <Field
        name="hidden"
        id="actualityCommentModal-hidden"
        type="checkbox"
        class="form-check-input"
        :value="true"
        :unchecked-value="false"
      />
      <label class="form-check-label" for="actualityCommentModal-hidden">Masqué au public</label>
    </div>
  </FormModal>
</template>
