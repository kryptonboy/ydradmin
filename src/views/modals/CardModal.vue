<script setup lang="ts">
import { useSubmit } from '@/composables/useSubmit'
import type { SubmissionContext } from 'vee-validate'
import { useExtensionsStore } from '@/stores'
import { useAbstractCardsStore } from '@/stores/abstract_cards.store'
import { useCardsStore } from '@/stores/cards.store'
import { useRaritiesStore } from '@/stores/rarities.store'
import type { AbstractCard } from '@/types/models/AbstractCard'
import type { Card } from '@/types/models/Card'
import type { Extension } from '@/types/models/Extension'
import type { Rarity } from '@/types/models/Rarity'
import { ErrorMessage, Field, Form as VeeForm } from 'vee-validate'
import type { FormContext } from 'vee-validate'
import { onMounted, ref, watch } from 'vue'
import * as yup from 'yup'
import AbstractCardModal from './AbstractCardModal.vue'
import FileUploader from '@/components/FileUploader.vue'
import type { CardForm } from '@/types/forms/CardForm'

const props = defineProps({
  card: { type: Object, default: null },
})

const modalEl = ref(null)
let modalInstance: bootstrap.Modal | null = null

const isEdit = ref(false)
const addOther = ref(false)
const imageId = ref<string | null>(null)
const isUploadingImage = ref(false)

const abstractCardModalRef = ref<InstanceType<typeof AbstractCardModal> | null>(null)

const formRef = ref<FormContext<Card> | null>(null)

const store = useCardsStore()
const abstractCardsStore = useAbstractCardsStore()
const extensionsStore = useExtensionsStore()
const raritiesStore = useRaritiesStore()

const abstractCards = ref<AbstractCard[]>([])
const extensions = ref<Extension[]>([])
const rarities = ref<Rarity[]>([])

const abstractCardsLoading = ref(false)
const extensionsLoading = ref(false)

const idSchema = yup.mixed<string | number>().required()
const schema = yup.object({
  name: yup.string().required('Nom requis'),
  description: yup.string().nullable(),
  reference: yup.string().required('Référence requise'),
  code: yup.string().nullable(),
  bbCodeDescription: yup.string().nullable(),
  pendulumDescription: yup.string().nullable(),
  bbCodePendulumDescription: yup.string().nullable(),
  abstractCard: yup.object({ id: idSchema }).nullable().default(null),
  extension: yup.object({ id: idSchema }),
  rarities: yup.array().of(yup.object({ id: idSchema })),
})

async function fetchAbstractCards(query: string) {
  if (!query) {
    abstractCards.value = []
    return
  }

  abstractCardsLoading.value = true
  try {
    abstractCards.value = await abstractCardsStore.autocomplete(query)
  } finally {
    abstractCardsLoading.value = false
  }
}

async function fetchExtensions(query: string) {
  if (!query) {
    extensions.value = []
    return
  }

  extensionsLoading.value = true
  try {
    extensions.value = await extensionsStore.autocomplete(query)
  } finally {
    extensionsLoading.value = false
  }
}

function processValues(values: Card): CardForm {
  return {
    name: values.name,
    reference: values.reference,
    code: values.code ?? undefined,
    description: values.description ?? undefined,
    bbCodeDescription: values.bbCodeDescription ?? undefined,
    pendulumDescription: values.pendulumDescription ?? undefined,
    bbCodePendulumDescription: values.bbCodePendulumDescription ?? undefined,
    abstractCard: values.abstractCard['@id'],
    extension: values.extension['@id'],
    rarities: values.rarities.map((rarity) => rarity['@id']),
  }
}

const { submitError, submit } = useSubmit()

const onSubmit = async (values: Card, { setErrors }: SubmissionContext) => {
  const payload: CardForm = processValues({ ...values })

  if (imageId.value) {
    payload.image = imageId.value
  }

  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.card.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('cardSaved')
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
        code: undefined,
        description: undefined,
        bbCodeDescription: undefined,
        pendulumDescription: undefined,
        bbCodePendulumDescription: undefined,
        abstractCard: undefined,
        extension: undefined,
        rarities: [],
      },
    })
  }
}

const hideModal = () => {
  modalInstance?.hide()
  submitError.value = null
  resetForm()
}

const showModal = () => {
  modalInstance?.show()
}

const emit = defineEmits(['cardSaved'])

watch(
  () => props.card,
  (newCard) => {
    isEdit.value = !!newCard
  },
  { immediate: true },
)

onMounted(async () => {
  if (modalEl.value) {
    modalInstance = new bootstrap.Modal(modalEl.value)
  }
  rarities.value = await raritiesStore.fetchAll()
})

function newAbstractCard() {
  if (null !== abstractCardModalRef.value) {
    abstractCardModalRef.value.showModal()
  }
}

function abstractCardCreated(createdAbstractCard: AbstractCard) {
  abstractCards.value.push(createdAbstractCard)
  formRef.value?.setFieldValue('abstractCard', createdAbstractCard)
}

defineExpose({ showModal })
</script>

<template>
  <div class="modal fade" id="cardModal" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <VeeForm
          ref="formRef"
          :validation-schema="schema"
          :initial-values="{
            name: props.card?.name ?? '',
            description: props.card?.description ?? undefined,
            reference: props.card?.reference ?? '',
            code: props.card?.code ?? undefined,
            bbCodeDescription: props.card?.bbCodeDescription ?? undefined,
            pendulumDescription: props.card?.pendulumDescription ?? undefined,
            bbCodePendulumDescription: props.card?.bbCodePendulumDescription ?? undefined,
            abstractCard: props.card?.abstractCard ?? undefined,
            extension: props.card?.extension ?? undefined,
            rarities: props.card?.rarities ?? [],
          }"
          :key="props.card?.id ?? 'new'"
          @submit="(values, ctx) => onSubmit(values as Card, ctx)"
        >
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edition' : 'Création' }} d'une carte</h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="submitError" class="alert alert-danger" role="alert">{{ submitError }}</div>
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <Field name="name" type="text" class="form-control" />
              <ErrorMessage name="name" class="text-danger small" />
            </div>
            <FileUploader
              v-model="imageId"
              v-model:uploading="isUploadingImage"
              label="Image"
              context="card"
            />
            <div class="mb-3">
              <label class="form-label">Référence</label>
              <Field name="reference" type="text" class="form-control" />
              <ErrorMessage name="reference" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Code</label>
              <Field name="code" type="text" class="form-control" />
              <ErrorMessage name="code" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <Field name="description" as="textarea" rows="3" class="form-control" />
              <ErrorMessage name="description" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">BBCode Description</label>
              <Field name="bbCodeDescription" as="textarea" rows="3" class="form-control" />
              <ErrorMessage name="bbCodeDescription" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">Description Pendulum</label>
              <Field name="pendulumDescription" as="textarea" rows="3" class="form-control" />
              <ErrorMessage name="pendulumDescription" class="text-danger small" />
            </div>
            <div class="mb-3">
              <label class="form-label">BBCode Description Pendulum</label>
              <Field name="bbCodePendulumDescription" as="textarea" rows="3" class="form-control" />
              <ErrorMessage name="bbCodePendulumDescription" class="text-danger small" />
            </div>
            <div class="mb-3">
              <Field name="abstractCard" v-slot="{ field }">
                <label class="form-label">Carte abstraite</label>
                <multi-select
                  v-model="field.value"
                  :options="abstractCards"
                  :searchable="true"
                  :loading="abstractCardsLoading"
                  :internal-search="false"
                  :close-on-select="true"
                  placeholder="Choisir une carte abstraite"
                  label="name"
                  track-by="id"
                  @search-change="fetchAbstractCards"
                  @update:model-value="field.onChange"
                >
                  <template #noResult>
                    <button type="button" class="btn btn-secondary" @click="newAbstractCard">
                      <font-awesome-icon :icon="['fa', 'plus']" />
                      Créer une carte abstraite
                    </button>
                  </template>
                </multi-select>
              </Field>
              <ErrorMessage name="abstractCard" class="text-danger small" />
            </div>
            <div class="mb-3">
              <Field name="extension" v-slot="{ field }">
                <label class="form-label">Extension</label>
                <multi-select
                  v-model="field.value"
                  :options="extensions"
                  :searchable="true"
                  :loading="extensionsLoading"
                  :internal-search="false"
                  :close-on-select="true"
                  placeholder="Choisir une extension"
                  label="name"
                  track-by="id"
                  @search-change="fetchExtensions"
                  @update:model-value="field.onChange"
                />
              </Field>
              <ErrorMessage name="extension" class="text-danger small" />
            </div>
            <div class="mb-3">
              <Field name="rarities" v-slot="{ field }">
                <label class="form-label">Raretés</label>
                <multi-select
                  v-model="field.value"
                  :options="rarities"
                  :multiple="true"
                  :taggable="false"
                  placeholder="Choisissez une oue plusieurs raretés"
                  label="name"
                  track-by="id"
                  @update:model-value="field.onChange"
                />
                <ErrorMessage name="rarities" class="text-danger small" />
              </Field>
            </div>
            <pre>{{ JSON.stringify(formRef?.values, null, 2) }}</pre>
          </div>
          <div class="modal-footer">
            <div class="form-check form-switch" v-if="!isEdit">
              <input
                class="form-check-input"
                type="checkbox"
                id="addOtherSwitch"
                v-model="addOther"
              />
              <label class="form-check-label" for="addOtherSwitch">Ajouter une autre carte</label>
            </div>
            <button type="button" class="btn btn-secondary" @click="hideModal">
              <font-awesome-icon :icon="['fa', 'xmark']" />
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isUploadingImage">
              <font-awesome-icon :icon="['fa', 'floppy-disk']" />
              {{ isEdit ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </VeeForm>
      </div>
    </div>
  </div>

  <AbstractCardModal
    ref="abstractCardModalRef"
    :abstract-card="undefined"
    @abstract-card-saved="abstractCardCreated"
  />
</template>
