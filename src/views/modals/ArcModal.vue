<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useArcsStore } from '@/stores'
import type { ArcForm } from '@/types/forms/ArcForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  arc: { type: Object, default: null },
  /** IRI de l'animé auquel l'arc est rattaché */
  animeIri: { type: String, required: true },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useArcsStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.arc)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  position: yup.number().typeError('Nombre requis').min(0).required('Position requise'),
  synopsis: yup.string().nullable(),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload: ArcForm = {
    name: values.name as string,
    position: values.position as number,
    synopsis: (values.synopsis as string) || null,
    anime: props.animeIri,
  }
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.arc.id, payload)
    } else {
      await store.create(payload)
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
    id="arcModal"
    title="d'un arc"
    add-other-label="Ajouter un autre arc"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.arc?.name ?? '',
      position: props.arc?.position ?? 0,
      synopsis: props.arc?.synopsis ?? '',
    }"
    :form-key="props.arc?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="arcModal-name">Nom</label>
      <Field name="name" id="arcModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="arcModal-position">Position</label>
      <Field name="position" id="arcModal-position" type="number" min="0" class="form-control" />
      <ErrorMessage name="position" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="arcModal-synopsis">Synopsis</label>
      <Field name="synopsis" id="arcModal-synopsis" as="textarea" rows="4" class="form-control" />
      <ErrorMessage name="synopsis" class="text-danger small" />
    </div>
  </FormModal>
</template>
