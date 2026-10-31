<script setup lang="ts">
import { useCountriesStore, useExtensionTypesStore } from '@/stores'
import { useExtensionsStore } from '@/stores/extensions.store'
import type { Country } from '@/types/models/Country'
import type { Extension } from '@/types/models/Extension'
import type { ExtensionType } from '@/types/models/ExtensionType'
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  extension: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)
const addOther = ref(false)

const countriesStore = useCountriesStore()
const extentionTypesStore = useExtensionTypesStore()

const countries = ref<Country[]>([])
const extensionTypes = ref<ExtensionType[]>([])

const formRef = ref<FormContext<Extension> | null>(null)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  reference: yup.string().required('Référence requise'),
  releaseDate: yup.date().nullable(),
  cardsCount: yup.number().required('Nombre de cartes requis'),
  extensionType: yup.object({ id: yup.string().required() }).nullable().required(),
  country: yup.object({ id: yup.string().required() }).nullable().required(),
})

const store = useExtensionsStore()

function processValues(values: Extension) {
  return {
    id: values.id,
    name: values.name,
    reference: values.reference,
    releaseDate: values.releaseDate,
    cardsCount: values.cardsCount,
    extensionType: values.extensionType['@id'],
    country: values.country['@id'],
  }
}

const onSubmit = async (values: Extension) => {
  if (isEdit.value) {
    await store.updateExtension(props.extension.id, processValues(values))
  } else {
    await store.createExtension(processValues(values))
  }
  emit('extensionSaved')
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
        reference: '',
        releaseDate: undefined,
        cardsCount: 0,
        extensionType: undefined,
        country: undefined,
      },
    })
  }
}

const hideModal = () => {
  modalInstance?.hide()
  resetForm()
}

const showModal = () => {
  modalInstance?.show()
}

const emit = defineEmits(['extensionSaved'])

const formatDateForInput = (date: Date | undefined | null) => {
  if (!date) return null
  return new Date(date).toISOString().split('T')[0]
}

watch(
  () => props.extension,
  (newExtension) => {
    isEdit.value = !!newExtension
  },
  { immediate: true },
)

onMounted(async () => {
  if (modalEl.value) {
    modalInstance = new bootstrap.Modal(modalEl.value)
  }
  countries.value = await countriesStore.fetchAll()
  extensionTypes.value = await extentionTypesStore.fetchAll()
})

defineExpose({ showModal })
</script>

<template>
  <div class="modal fade" id="extensionModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          ref="formRef"
          :validation-schema="schema"
          :initial-values="{
            name: props.extension?.name ?? '',
            reference: props.extension?.reference ?? '',
            releaseDate: formatDateForInput(props.extension?.releaseDate ?? null),
            cardsCount: props.extension?.cardsCount ?? 0,
            extensionType: props.extension?.extensionType ?? null,
            country: props.extension?.country ?? null,
          }"
          :key="props.extension?.id ?? 'new'"
          @submit="(values) => onSubmit(values as Extension)"
        >
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edition' : 'Création' }} d'une extension</h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <Field name="name" type="text" class="form-control" />
              <ErrorMessage name="name" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Référence</label>
              <Field name="reference" type="text" class="form-control" />
              <ErrorMessage name="reference" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Date de release</label>
              <Field name="releaseDate" type="date" class="form-control" />
              <ErrorMessage name="releaseDate" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Nombre de cartes</label>
              <Field name="cardsCount" type="number" class="form-control" />
              <ErrorMessage name="cardsCount" class="text-danger small" />
            </div>
            <div class="mb-3">
              <Field name="extensionType" v-slot="{ field }">
                <label class="form-label">Type d'extension</label>
                <multi-select
                  v-model="field.value"
                  :options="extensionTypes"
                  label="name"
                  track-by="id"
                  placeholder="Choisir un type d'extension"
                  @update:model-value="field.onChange"
                />
              </Field>
              <ErrorMessage name="extensionType" class="text-danger small" />
            </div>
            <div class="mb-3">
              <Field name="country" v-slot="{ field }">
                <label class="form-label">Pays</label>
                <multi-select
                  v-model="field.value"
                  :options="countries"
                  label="name"
                  track-by="id"
                  placeholder="Choisissez un pays"
                  @update:model-value="field.onChange"
                />
              </Field>
              <ErrorMessage name="country" class="text-danger small" />
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
              <label class="form-check-label" for="addOtherSwitch"
                >Ajouter une autre extension</label
              >
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
