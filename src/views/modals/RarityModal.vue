<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useRaritiesStore } from '@/stores'
import type { Rarity } from '@/types/models/Rarity'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  rarity: { type: Object, default: null },
})

const emit = defineEmits(['raritySaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useRaritiesStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.rarity)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  description: yup.string(),
  position: yup.number().required('Position requise'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const rarity = values as unknown as Rarity
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.rarity.id, rarity)
    } else {
      await store.create(rarity)
    }
  }, setErrors)
  if (!saved) return
  emit('raritySaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="rarityModal"
    title="d'une rareté"
    add-other-label="Ajouter une autre rareté"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.rarity?.name ?? '',
      description: props.rarity?.description ?? '',
      position: props.rarity?.position ?? 0,
    }"
    :form-key="props.rarity?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="rarityModal-name">Nom</label>
      <Field name="name" id="rarityModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="rarityModal-description">Description</label>
      <Field
        name="description"
        id="rarityModal-description"
        as="textarea"
        rows="3"
        class="form-control"
      />
      <ErrorMessage name="description" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="rarityModal-position">Position</label>
      <Field name="position" id="rarityModal-position" type="number" class="form-control" />
      <ErrorMessage name="position" class="text-danger small" />
    </div>
  </FormModal>
</template>
