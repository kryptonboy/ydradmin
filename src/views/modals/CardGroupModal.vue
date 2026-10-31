<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useCardGroupsStore } from '@/stores'
import type { CardGroup } from '@/types/models/CardGroup'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  cardGroup: { type: Object, default: null },
})

const emit = defineEmits(['cardGroupSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useCardGroupsStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.cardGroup)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const cardGroupValues = values as unknown as CardGroup
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.cardGroup.id, cardGroupValues)
    } else {
      await store.create(cardGroupValues)
    }
  }, setErrors)
  if (!saved) return
  emit('cardGroupSaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="cardGroupModal"
    title="d'un groupe de cartes"
    add-other-label="Ajouter un autre groupe"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{ name: props.cardGroup?.name ?? '' }"
    :form-key="props.cardGroup?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="cardGroupModal-name">Nom</label>
      <Field name="name" id="cardGroupModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
  </FormModal>
</template>
