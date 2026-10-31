<script setup lang="ts">
import { useMonsterTypesStore } from '@/stores/monster_types.store'
import type { MonsterType } from '@/types/models/MonsterType'
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  monsterType: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)
const addOther = ref(false)

const formRef = ref<FormContext<MonsterType> | null>(null)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
})

const store = useMonsterTypesStore()
const onSubmit = async (values: MonsterType) => {
  if (isEdit.value) {
    await store.updateMonsterType(props.monsterType.id, values)
  } else {
    await store.createMonsterType(values)
  }
  emit('monsterTypeSaved')
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

const emit = defineEmits(['monsterTypeSaved'])

watch(
  () => props.monsterType,
  (newMonsterType) => {
    isEdit.value = !!newMonsterType
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
  <div class="modal fade" id="monsterTypeModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          ref="formRef"
          :validation-schema="schema"
          :initial-values="{ name: props.monsterType?.name ?? '' }"
          :key="props.monsterType?.id ?? 'new'"
          @submit="(values) => onSubmit(values as MonsterType)"
        >
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edition' : 'Création' }} d'un type de monstre</h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <Field name="name" type="text" class="form-control" />
              <ErrorMessage name="name" class="text-danger small" />
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
              <label class="form-check-label" for="addOtherSwitch"> Ajouter un autre type </label>
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
