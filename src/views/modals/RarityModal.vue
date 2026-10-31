<script setup lang="ts">
import { useRaritiesStore } from '@/stores/rarities.store'
import type { Rarity } from '@/types/models/Rarity'
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  rarity: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)
const addOther = ref(false)

const formRef = ref<FormContext<Rarity> | null>(null)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  description: yup.string(),
  position: yup.number().required('Position requise'),
})

const store = useRaritiesStore()
const onSubmit = async (values: Rarity) => {
  if (isEdit.value) {
    await store.updateRarity(props.rarity.id, values)
  } else {
    await store.createRarity(values)
  }
  emit('raritySaved')
  if (addOther.value === true && !isEdit.value) {
    resetForm()
  } else {
    hideModal()
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetForm({
      values: {
        name: '',
        description: '',
        position: 0,
      },
    })
  }
}

const hideModal = () => {
  modalInstance.hide()
  resetForm()
}

const showModal = () => {
  modalInstance.show()
}

const emit = defineEmits(['raritySaved'])

watch(
  () => props.rarity,
  (newRarity) => {
    isEdit.value = !!newRarity
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
  <div class="modal fade" id="rarityModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          ref="formRef"
          :validation-schema="schema"
          :initial-values="{
            name: props.rarity?.name ?? '',
            description: props.rarity?.description ?? '',
            position: props.rarity?.position ?? 0,
          }"
          :key="props.rarity?.id ?? 'new'"
          @submit="onSubmit"
        >
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edition' : 'Création' }} d'une rareté</h5>
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
            <div class="mb-3">
              <label class="form-label">Position</label>
              <Field name="position" type="number" class="form-control" />
              <ErrorMessage name="position" class="text-danger small" />
            </div>
          </div>
          <div class="modal-footer">
            <div class="form-check form-switch" v-if="!isEdit">
              <input
                class="form-check-input"
                type="checkbox"
                id="addOtherSwitch"
                v-model="addOther"
              />
              <label class="form-check-label" for="addOtherSwitch">Ajouter une autre rareté</label>
            </div>
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
