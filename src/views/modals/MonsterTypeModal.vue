<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useMonsterTypesStore } from '@/stores'
import type { MonsterType } from '@/types/models/MonsterType'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  monsterType: { type: Object, default: null },
})

const emit = defineEmits(['monsterTypeSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useMonsterTypesStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.monsterType)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as MonsterType
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.monsterType.id, form)
    } else {
      await store.create(form)
    }
  }, setErrors)
  if (!saved) return
  emit('monsterTypeSaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="monsterTypeModal"
    title="d'un type de monstre"
    add-other-label="Ajouter un autre type"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{ name: props.monsterType?.name ?? '' }"
    :form-key="props.monsterType?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
  >
    <div class="mb-3">
      <label class="form-label">Nom</label>
      <Field name="name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
  </FormModal>
</template>
