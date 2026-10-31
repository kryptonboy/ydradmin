<script setup lang="ts">
import { Form as VeeForm, type SubmissionContext } from 'vee-validate'
import { onMounted, ref, useTemplateRef } from 'vue'

defineProps<{
  /** Identifiant DOM de la modale */
  id: string
  /** Complément du titre : « Édition / Création » + ce texte (ex. « d'une rareté ») */
  title: string
  isEdit: boolean
  /** Schéma de validation yup */
  schema: object
  initialValues: Record<string, unknown>
  /** Change quand l'élément édité change, pour réinitialiser le formulaire */
  formKey: string | number
  /** Libellé de la case « Ajouter … » (création uniquement) ; absente = pas de case */
  addOtherLabel?: string
  submitError: string | null
  /** Désactive l'envoi (ex. upload en cours) */
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: [values: Record<string, unknown>, ctx: SubmissionContext]
  /** Le formulaire vient d'être vidé : réinitialiser l'état externe (uploads, etc.) */
  reset: []
}>()

const modalEl = useTemplateRef<HTMLElement>('modalEl')
const form = useTemplateRef<InstanceType<typeof VeeForm>>('form')
const addOther = ref(false)
let modalInstance: bootstrap.Modal | null = null

onMounted(() => {
  if (modalEl.value) {
    modalInstance = new bootstrap.Modal(modalEl.value)
  }
})

function show() {
  modalInstance?.show()
}

function reset() {
  form.value?.resetForm()
  emit('reset')
}

function hide() {
  modalInstance?.hide()
  reset()
}

/** À appeler après un enregistrement réussi : vide le formulaire ou ferme la modale. */
function finish(isEdit: boolean) {
  if (addOther.value && !isEdit) {
    reset()
  } else {
    hide()
  }
}

function setFieldValue(name: string, value: unknown) {
  form.value?.setFieldValue(name, value)
}

defineExpose({ show, hide, finish, setFieldValue })
</script>

<template>
  <div :id="id" class="modal fade" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          ref="form"
          :validation-schema="schema"
          :initial-values="initialValues"
          :key="formKey"
          v-slot="slotProps"
          @submit="(values, ctx) => emit('submit', values, ctx)"
        >
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edition' : 'Création' }} {{ title }}</h5>
            <button type="button" class="btn-close" aria-label="Fermer" @click="hide"></button>
          </div>
          <div class="modal-body">
            <div v-if="submitError" class="alert alert-danger" role="alert">{{ submitError }}</div>
            <slot v-bind="slotProps" />
          </div>
          <div class="modal-footer">
            <div class="form-check form-switch" v-if="!isEdit && addOtherLabel">
              <input
                class="form-check-input"
                type="checkbox"
                :id="`${id}AddOther`"
                v-model="addOther"
              />
              <label class="form-check-label" :for="`${id}AddOther`">{{ addOtherLabel }}</label>
            </div>
            <button type="button" class="btn btn-secondary" @click="hide">
              <font-awesome-icon :icon="['fa', 'xmark']" />
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="disabled">
              <font-awesome-icon :icon="['fa', 'floppy-disk']" />
              {{ isEdit ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </VeeForm>
      </div>
    </div>
  </div>
</template>
