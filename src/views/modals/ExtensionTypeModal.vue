<script setup lang="ts">
import { useSubmit } from '@/composables/useSubmit'
import type { SubmissionContext } from 'vee-validate'
import type { ExtensionType } from '@/types/models/ExtensionType'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate'
import { useExtensionTypesStore } from '@/stores'

const props = defineProps({
  extensionType: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  position: yup.number().integer().required('Position requise').min(1),
})

const store = useExtensionTypesStore()
const { submitError, submit } = useSubmit()

const onSubmit = async (values: ExtensionType, { setErrors }: SubmissionContext) => {
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.extensionType.id, values)
    } else {
      await store.create(values)
    }
  }, setErrors)
  if (!saved) return
  emit('extensionTypeSaved')
  hideModal()
}

const hideModal = () => {
  modalInstance?.hide()
  submitError.value = null
}

const showModal = () => {
  modalInstance?.show()
}

const emit = defineEmits(['extensionTypeSaved'])

watch(
  () => props.extensionType,
  (newExtensionType) => {
    isEdit.value = !!newExtensionType
  },
  { immediate: true },
)

onMounted(() => {
  if (modalEl.value) {
    modalInstance = new bootstrap.Modal(modalEl.value)
  }
})

defineExpose({ showModal })
</script>

<template>
  <div class="modal fade" id="extensionTypeModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          :validation-schema="schema"
          :initial-values="{
            name: props.extensionType?.name ?? '',
            position: props.extensionType?.position ?? 1,
          }"
          :key="props.extensionType?.id ?? 'new'"
          @submit="(values, ctx) => onSubmit(values as ExtensionType, ctx)"
        >
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edition' : 'Création' }} d'un type d'extension</h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="submitError" class="alert alert-danger" role="alert">{{ submitError }}</div>
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <Field name="name" type="text" class="form-control" />
              <ErrorMessage name="name" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Position</label>
              <Field name="position" type="number" class="form-control" />
              <ErrorMessage name="position" class="text-danger small" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideModal">
              <font-awesome-icon :icon="['fa', 'xmark']" />
              Annuler
            </button>
            <button type="submit" class="btn btn-primary">
              <font-awesome-icon :icon="['fa', 'floppy-disk']" />
              {{ isEdit ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </VeeForm>
      </div>
    </div>
  </div>
</template>
