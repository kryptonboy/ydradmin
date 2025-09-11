<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import { useCardSubTypesStore } from '@/stores/card_sub_types.store'
import { useCardTypesStore } from '@/stores/card_types.store'
import type { CardSubTypeForm } from '@/types/forms/CardSubTypeForm'
import type { CardSubType } from '@/types/models/CardSubType'
import { CardType } from '@/types/models/CardType'
import { Field, ErrorMessage, Form as VeeForm } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  cardSubType: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)
const addOther = ref(false)
const iconId = ref<string | null>(null)
const isUploadingIcon = ref(false)

const cardTypesStore = useCardTypesStore()
const cardTypes = ref<CardType[]>([])

const formRef = ref<FormContext<CardSubType> | null>(null)
const iconUploaderRef = ref<InstanceType<typeof FileUploader> | null>(null)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  cssClass: yup.string().required('Champ requis'),
  position: yup.number().required('Position requise'),
  cardType: yup.object({ id: yup.string().required() }).nullable().required(),
})

const store = useCardSubTypesStore()

function processValues(values: CardSubType) {
  return {
    id: values.id,
    name: values.name,
    cssClass: values.cssClass,
    position: values.position,
    cardType: values.cardType['@id'],
  }
}

const onSubmit = async (values: CardSubType) => {
  const payload: CardSubTypeForm = processValues({ ...values })

  if (iconId.value) {
    payload.icon = iconId.value
  }

  if (isEdit.value) {
    await store.updateCardSubType(props.cardSubType.id, payload)
  } else {
    await store.createCardSubType(payload)
  }
  emit('cardSubTypeSaved')
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
        cssClass: '',
        position: 0,
        cardType: undefined,
      },
    })
    if (iconUploaderRef.value) {
      iconUploaderRef.value.clearFile()
    }
  }
}

const hideModal = () => {
  modalInstance.hide()
  resetForm()
}

const showModal = () => {
  modalInstance.show()
}

const emit = defineEmits(['cardSubTypeSaved'])

watch(
  () => props.cardSubType,
  (newCardSubType) => {
    isEdit.value = !!newCardSubType
  },
  { immediate: true },
)

onMounted(async () => {
  if (modalEl.value) {
    modalInstance = new bootstrap.Modal(modalEl.value)
  }
  cardTypes.value = await cardTypesStore.fetchAll()
})

defineExpose({ showModal })
</script>

<template>
  <div class="modal fade" id="cardSubTypeModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          ref="formRef"
          :validation-schema="schema"
          :initial-values="{
            name: props.cardSubType?.name ?? '',
            cssClass: props.cardSubType?.cssClass ?? '',
            position: props.cardSubType?.position ?? 0,
            cardType: props.cardSubType?.cardType ?? null,
          }"
          :key="props.cardSubType?.id ?? 'new'"
          @submit="onSubmit"
        >
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEdit ? 'Edition' : 'Création' }} d'un sous-type de carte
            </h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <Field name="name" type="text" class="form-control" />
              <ErrorMessage name="name" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Classe CSS</label>
              <Field name="cssClass" type="text" class="form-control" />
              <ErrorMessage name="cssClass" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Position</label>
              <Field name="position" type="number" class="form-control" />
              <ErrorMessage name="position" class="text-danger small" />
            </div>
            <div class="mb-3">
              <Field name="cardType" v-slot="{ field }">
                <label class="form-label">Type de carte</label>
                <multi-select
                  v-model="field.value"
                  :options="cardTypes"
                  label="name"
                  track-by="id"
                  placeholder="Choisir un type de carte"
                  @update:model-value="field.onChange"
                />
              </Field>
              <ErrorMessage name="cardType" class="text-danger small" />
            </div>
            <FileUploader
              v-model="iconId"
              v-model:uploading="isUploadingIcon"
              label="Icône"
              context="card_sub_type"
              ref="iconUploaderRef"
            />
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
                >Ajouter un autre sous-type</label
              >
            </div>
            <button type="button" class="btn btn-secondary" @click="hideModal">
              <font-awesome-icon :icon="['fa', 'xmark']" />
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isUploadingIcon">
              <font-awesome-icon :icon="['fa', 'floppy-disk']" />
              {{ isEdit ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </VeeForm>
      </div>
    </div>
  </div>
</template>
