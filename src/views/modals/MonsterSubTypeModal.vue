<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useMonsterSubTypesStore } from '@/stores'
import type { MonsterSubType } from '@/types/models/MonsterSubType'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  monsterSubType: { type: Object, default: null },
})

const emit = defineEmits(['monsterSubTypeSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useMonsterSubTypesStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.monsterSubType)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as MonsterSubType
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.monsterSubType.id, form)
    } else {
      await store.create(form)
    }
  }, setErrors)
  if (!saved) return
  emit('monsterSubTypeSaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="monsterSubTypeModal"
    title="d'un sous-type de monstre"
    add-other-label="Ajouter un autre sous-type"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{ name: props.monsterSubType?.name ?? '' }"
    :form-key="props.monsterSubType?.id ?? 'new'"
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
