<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import FormModal from '@/components/FormModal.vue'
import MediaThumb from '@/components/MediaThumb.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useMonsterAttributesStore } from '@/stores'
import type { MonsterAttributeForm } from '@/types/forms/MonsterAttributeForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  monsterAttribute: { type: Object, default: null },
})

const emit = defineEmits(['monsterAttributeSaved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const iconUploader = useTemplateRef<InstanceType<typeof FileUploader>>('iconUploader')
const store = useMonsterAttributesStore()
const { submitError, submit } = useSubmit()

const iconId = ref<string | null>(null)
const isUploadingIcon = ref(false)
const isEdit = computed(() => !!props.monsterAttribute)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload = { ...values } as unknown as MonsterAttributeForm
  if (iconId.value) {
    payload.icon = iconId.value
  }

  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.monsterAttribute.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('monsterAttributeSaved')
  modal.value?.finish(isEdit.value)
}

function onReset() {
  submitError.value = null
  iconId.value = null
  iconUploader.value?.clearFile()
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="monsterAttributeModal"
    title="d'un attribut de monstre"
    add-other-label="Ajouter un autre attribut"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{ name: props.monsterAttribute?.name ?? '' }"
    :form-key="props.monsterAttribute?.id ?? 'new'"
    :submit-error="submitError"
    :disabled="isUploadingIcon"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label" for="monsterAttributeModal-name">Nom</label>
      <Field name="name" id="monsterAttributeModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <MediaThumb v-if="!iconId" :media="props.monsterAttribute?.icon" alt="Icône actuelle" />
    <FileUploader
      ref="iconUploader"
      v-model="iconId"
      v-model:uploading="isUploadingIcon"
      label="Icône"
      context="monster_attribute"
    />
  </FormModal>
</template>
