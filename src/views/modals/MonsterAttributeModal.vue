<script setup lang="ts">
import FileUploader from '@/components/FileUploader.vue'
import { useMonsterAttributesStore } from '@/stores/monster_attributes.store'
import type { MonsterAttribute } from '@/types/models/MonsterAttribute'
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  monsterAttribute: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)
const addOther = ref(false)
const iconId = ref<string | null>(null)
const isUploadingIcon = ref(false)

const formRef = ref<FormContext<MonsterAttribute> | null>(null)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
})

const store = useMonsterAttributesStore()
const onSubmit = async (values: MonsterAttribute) => {
  const payload: MonsterAttribute = { ...values }

  if (iconId.value) {
    payload.icon = iconId.value
  }

  if (isEdit.value) {
    await store.updateMonsterAttribute(props.monsterAttribute.id, payload)
  } else {
    await store.createMonsterAttribute(payload)
  }
  emit('monsterAttributeSaved')
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

const emit = defineEmits(['monsterAttributeSaved'])

watch(
  () => props.monsterAttribute,
  (newMonsterAttribute) => {
    isEdit.value = !!newMonsterAttribute
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
  <div class="modal fade" id="monsterAttributeModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          ref="formRef"
          :validation-schema="schema"
          :initial-values="{ name: props.monsterAttribute?.name ?? '' }"
          :key="props.monsterAttribute?.id ?? 'new'"
          @submit="(values) => onSubmit(values as MonsterAttribute)"
        >
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEdit ? 'Edition' : 'Création' }} d'un attribut de monstre
            </h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <Field name="name" type="text" class="form-control" />
              <ErrorMessage name="name" class="text-danger small" />
            </div>
            <FileUploader
              v-model="iconId"
              v-model:uploading="isUploadingIcon"
              label="Icône"
              context="monster_attribute"
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
              <label class="form-check-label" for="addOtherSwitch">Ajouter un autre attribut</label>
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
