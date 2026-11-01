<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useAbstractCardsStore, useRulingsStore } from '@/stores'
import type { RulingForm } from '@/types/forms/RulingForm'
import type { AbstractCard } from '@/types/models/AbstractCard'
import type { NamedRef } from '@/types/models/Ref'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  ruling: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useRulingsStore()
const abstractCardsStore = useAbstractCardsStore()
const { submitError, submit } = useSubmit()

const cards = ref<AbstractCard[]>([])
const cardsLoading = ref(false)
const isEdit = computed(() => !!props.ruling)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  ruling: yup.string().required('Texte du ruling requis'),
  abstractCards: yup.array().of(yup.object({ id: yup.string().required() })),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as { name: string; ruling: string; abstractCards?: NamedRef[] }
  // La liste remplace l'existant : [] détache toutes les cartes
  const payload: RulingForm = {
    name: form.name,
    ruling: form.ruling,
    abstractCards: (form.abstractCards ?? []).map((card) => card['@id']),
  }
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.ruling.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('saved')
  modal.value?.finish(isEdit.value)
}

async function searchCards(query: string) {
  if (!query) {
    cards.value = []
    return
  }
  cardsLoading.value = true
  try {
    cards.value = await abstractCardsStore.autocomplete(query)
  } finally {
    cardsLoading.value = false
  }
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="rulingModal"
    title="d'un ruling"
    add-other-label="Ajouter un autre ruling"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.ruling?.name ?? '',
      ruling: props.ruling?.ruling ?? '',
      abstractCards: props.ruling?.abstractCards ?? [],
    }"
    :form-key="props.ruling?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="rulingModal-name">Nom</label>
      <Field name="name" id="rulingModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="rulingModal-ruling">Ruling</label>
      <Field name="ruling" id="rulingModal-ruling" as="textarea" rows="6" class="form-control" />
      <ErrorMessage name="ruling" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="abstractCards" v-slot="{ field }">
        <label class="form-label" for="rulingModal-abstractCards">Cartes concernées</label>
        <multi-select
          id="rulingModal-abstractCards"
          v-model="field.value"
          :options="cards"
          multiple
          :searchable="true"
          :close-on-select="false"
          :loading="cardsLoading"
          :internal-search="false"
          placeholder="Rechercher une ou plusieurs cartes"
          label="name"
          track-by="id"
          @search-change="searchCards"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="abstractCards" class="text-danger small" />
    </div>
  </FormModal>
</template>
