<script setup lang="ts">
import { useCountriesStore } from '@/stores'
import type { Country } from '@/types/models/Country'
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  country: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  code: yup
    .string()
    .required('Code requis')
    .length(3, 'Le code doit faire exactement 3 caractères'),
  position: yup.number().required('Position requise').min(1),
})

const store = useCountriesStore()
const onSubmit = async (values: Country) => {
  if (isEdit.value) {
    await store.updateCountry(props.country.id, values)
  } else {
    await store.createCountry(values)
  }
  emit('countrySaved')
  hideModal()
}

const hideModal = () => {
  modalInstance?.hide()
}

const showModal = () => {
  modalInstance?.show()
}

const emit = defineEmits(['countrySaved'])

watch(
  () => props.country,
  (newCountry) => {
    isEdit.value = !!newCountry
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
  <div class="modal fade" id="countryModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          :validation-schema="schema"
          :initial-values="{
            name: props.country?.name ?? '',
            code: props.country?.code ?? '',
            position: props.country?.position ?? 1,
          }"
          :key="props.country?.id ?? 'new'"
          @submit="(values) => onSubmit(values as Country)"
        >
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edition' : 'Création' }} d'un pays</h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <Field name="name" type="text" class="form-control" />
              <ErrorMessage name="name" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Code Alpha-3</label>
              <Field name="code" type="text" class="form-control" />
              <ErrorMessage name="code" class="text-danger small" />
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
