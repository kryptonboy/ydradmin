<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useSeasonsStore } from '@/stores'
import type { SeasonForm } from '@/types/forms/SeasonForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  season: { type: Object, default: null },
  /** IRI de l'animé auquel la saison est rattachée */
  animeIri: { type: String, required: true },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useSeasonsStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.season)

const schema = yup.object({
  seasonNumber: yup.number().typeError('Numéro requis').min(0).required('Numéro requis'),
  synopsis: yup.string().nullable(),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload: SeasonForm = {
    seasonNumber: values.seasonNumber as number,
    synopsis: (values.synopsis as string) || null,
    anime: props.animeIri,
  }
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.season.id, payload)
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
    id="seasonModal"
    title="d'une saison"
    add-other-label="Ajouter une autre saison"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      seasonNumber: props.season?.seasonNumber ?? 1,
      synopsis: props.season?.synopsis ?? '',
    }"
    :form-key="props.season?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="seasonModal-seasonNumber">Numéro de saison</label>
      <Field
        name="seasonNumber"
        id="seasonModal-seasonNumber"
        type="number"
        min="0"
        class="form-control"
      />
      <ErrorMessage name="seasonNumber" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="seasonModal-synopsis">Synopsis</label>
      <Field
        name="synopsis"
        id="seasonModal-synopsis"
        as="textarea"
        rows="4"
        class="form-control"
      />
      <ErrorMessage name="synopsis" class="text-danger small" />
    </div>
  </FormModal>
</template>
