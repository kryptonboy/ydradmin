<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
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
import { ErrorMessage, Field } from 'vee-validate'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'
import AbstractCardModal from './AbstractCardModal.vue'
import FileUploader from '@/components/FileUploader.vue'
import type { CardForm } from '@/types/forms/CardForm'

const props = defineProps({
  card: { type: Object, default: null },
})

const imageId = ref<string | null>(null)
const isUploadingImage = ref(false)

const abstractCardModalRef = ref<InstanceType<typeof AbstractCardModal> | null>(null)

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

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const imageUploader = useTemplateRef<InstanceType<typeof FileUploader>>('imageUploader')
const { submitError, submit } = useSubmit()
const isEdit = computed(() => !!props.card)

function onReset() {
  imageId.value = null
  imageUploader.value?.clearFile()
  submitError.value = null
}

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload: CardForm = processValues(values as unknown as Card)

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
  modal.value?.finish(isEdit.value)
}

const emit = defineEmits(['cardSaved'])

onMounted(async () => {
  rarities.value = await raritiesStore.fetchAll()
})

function newAbstractCard() {
  if (null !== abstractCardModalRef.value) {
    abstractCardModalRef.value.showModal()
  }
}

function abstractCardCreated(createdAbstractCard: AbstractCard) {
  abstractCards.value.push(createdAbstractCard)
  modal.value?.setFieldValue('abstractCard', createdAbstractCard)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="cardModal"
    title="d'une carte"
    add-other-label="Ajouter une autre carte"
    :is-edit="isEdit"
    :schema="schema"
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
    :form-key="props.card?.id ?? 'new'"
    :submit-error="submitError"
    :disabled="isUploadingImage"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label">Nom</label>
      <Field name="name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <FileUploader
      ref="imageUploader"
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
  </FormModal>

  <AbstractCardModal
    ref="abstractCardModalRef"
    :abstract-card="undefined"
    @abstract-card-saved="abstractCardCreated"
  />
</template>
