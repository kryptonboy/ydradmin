<script setup lang="ts">
import { useTagsStore } from '@/stores'
import type { Tag } from '@/types/Tag'
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  tag: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  description: yup.string().required('Description requise'),
  visible: yup.boolean().default(true),
})

const store = useTagsStore()
const onSubmit = async (values: Tag) => {
  if (isEdit.value) {
    await store.updateTag(props.tag.id, values)
  } else {
    await store.createTag(values)
  }
  emit('tagSaved')
  hideModal()
}

const hideModal = () => {
  modalInstance.hide()
}

const showModal = () => {
  modalInstance.show()
}

const emit = defineEmits(['tagSaved'])

watch(
  () => props.tag,
  (newTag) => {
    isEdit.value = !!newTag
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
  <div class="modal fade" id="tagModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          :validation-schema="schema"
          :initial-values="{
            name: props.tag?.name ?? '',
            description: props.tag?.description ?? '',
            visible: props.tag?.visible ?? true,
          }"
          :key="props.tag?.id ?? 'new'"
          @submit="onSubmit"
        >
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edition' : 'Création' }} d'un tag</h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
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
            <div class="form-check">
              <Field
                name="visible"
                type="checkbox"
                class="form-check-input"
                id="tagVisible"
                :value="true"
                :unchecked-value="false"
              />
              <label class="form-check-label" for="tagVisible">Visible</label>
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
