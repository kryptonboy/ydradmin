<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useMonsterEffectsStore } from '@/stores'
import type { MonsterEffect } from '@/types/models/MonsterEffect'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  monsterEffect: { type: Object, default: null },
})

const emit = defineEmits(['monsterEffectSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useMonsterEffectsStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.monsterEffect)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  description: yup.string(),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as unknown as MonsterEffect
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.monsterEffect.id, form)
    } else {
      await store.create(form)
    }
  }, setErrors)
  if (!saved) return
  emit('monsterEffectSaved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="monsterEffectModal"
    title="d'un effet de monstre"
    add-other-label="Ajouter un autre effet"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.monsterEffect?.name ?? '',
      description: props.monsterEffect?.description ?? '',
    }"
    :form-key="props.monsterEffect?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
  >
    <div class="mb-3">
      <label class="form-label">Nom</label>
      <Field name="name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label">Description</label>
      <Field name="description" as="textarea" rows="3" class="form-control" />
      <ErrorMessage name="description" class="text-danger small" />
    </div>
  </FormModal>
</template>
