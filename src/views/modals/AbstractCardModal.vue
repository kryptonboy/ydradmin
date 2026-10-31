<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { getErrorMessage } from '@/helpers/api-error'
import { useSubmit } from '@/composables/useSubmit'
import type { SubmissionContext } from 'vee-validate'
import { useCardSubTypesStore, useTagsStore } from '@/stores'
import { useAbstractCardsStore } from '@/stores/abstract_cards.store'
import { useCardGroupsStore } from '@/stores/card_groups.store'
import { useMonsterAttributesStore } from '@/stores/monster_attributes.store'
import { useMonsterEffectsStore } from '@/stores/monster_effects.store'
import { useMonsterSubTypesStore } from '@/stores/monster_sub_types.store'
import { useMonsterTypesStore } from '@/stores/monster_types.store'
import type { AbstractCardForm } from '@/types/forms/AbstractCardForm'
import type { TagForm } from '@/types/forms/TagForm'
import type { AbstractCard } from '@/types/models/AbstractCard'
import type { CardGroup } from '@/types/models/CardGroup'
import type { CardSubType } from '@/types/models/CardSubType'
import type { MonsterAttribute } from '@/types/models/MonsterAttribute'
import type { MonsterEffect } from '@/types/models/MonsterEffect'
import type { MonsterSubType } from '@/types/models/MonsterSubType'
import type { MonsterType } from '@/types/models/MonsterType'
import type { Tag } from '@/types/models/Tag'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  abstractCard: { type: Object, default: null },
})

// Stores
const cardSubTypesStore = useCardSubTypesStore()
const cardGroupsStore = useCardGroupsStore()
const monsterAttributesStore = useMonsterAttributesStore()
const monsterSubTypesStore = useMonsterSubTypesStore()
const monsterTypesStore = useMonsterTypesStore()
const monsterEffectsStore = useMonsterEffectsStore()
const tagsStore = useTagsStore()
// Collections
const cardSubTypes = ref<CardSubType[]>([])
const cardGroups = ref<CardGroup[]>([])
const monsterAttributes = ref<MonsterAttribute[]>([])
const monsterSubTypes = ref<MonsterSubType[]>([])
const monsterTypes = ref<MonsterType[]>([])
const monsterEffects = ref<MonsterEffect[]>([])
const tags = ref<Tag[]>([])
// Loading states
const cardGroupLoading = ref(false)
const tagLoading = ref(false)

// Autocompletions
async function fetchCardGroups(query: string) {
  if (!query) {
    cardGroups.value = []
    return
  }

  cardGroupLoading.value = true
  try {
    cardGroups.value = await cardGroupsStore.autocomplete(query)
  } finally {
    cardGroupLoading.value = false
  }
}

async function fetchTags(query: string) {
  if (!query) {
    tags.value = []
    return
  }

  tagLoading.value = true
  try {
    tags.value = await tagsStore.autocomplete(query)
  } finally {
    tagLoading.value = false
  }
}

async function createTag(newTagName: string) {
  tagLoading.value = true
  try {
    const newTag: TagForm = { name: newTagName, description: '', visible: false }
    const createdTag = await tagsStore.create(newTag)
    if (createdTag) {
      if (!tags.value.find((t) => t.id === createdTag.id)) {
        tags.value.push(createdTag)
      }
      return createdTag
    }
  } catch (err) {
    submitError.value = getErrorMessage(err)
  } finally {
    tagLoading.value = false
  }
}

const idSchema = yup.mixed<string | number>().required()
const schema = yup.object({
  name: yup.string().required('Nom requis'),
  level: yup.number().nullable(),
  atk: yup.number().nullable(),
  def: yup.number().nullable(),
  bluePendulum: yup.number().nullable(),
  redPendulum: yup.number().nullable(),
  cardSubType: yup.object({ id: idSchema }).nullable().required(),
  cardGroup: yup.object({ id: idSchema }).nullable().default(null),
  monsterAttribute: yup.object({ id: idSchema }).nullable().default(null),
  monsterSubType: yup.object({ id: idSchema }).nullable().default(null),
  monsterType: yup.object({ id: idSchema }).nullable().default(null),
  monsterEffects: yup.array().of(yup.object({ id: idSchema })),
  tags: yup.array().of(yup.object({ id: idSchema })),
})

const store = useAbstractCardsStore()

function processValues(values: AbstractCard): AbstractCardForm {
  const result: AbstractCardForm = {
    name: values.name,
    level: values.level ?? undefined,
    atk: values.atk ?? undefined,
    def: values.def ?? undefined,
    bluePendulum: values.bluePendulum ?? undefined,
    redPendulum: values.redPendulum ?? undefined,
    cardSubType: values.cardSubType['@id'],
    cardGroup: values.cardGroup?.['@id'] ?? undefined,
    monsterEffects: [],
    tags: [],
  }

  if (values.monsterAttribute?.id) {
    result.monsterAttribute = values.monsterAttribute['@id']
  }

  if (values.monsterSubType?.id) {
    result.monsterSubType = values.monsterSubType['@id']
  }

  if (values.monsterType?.id) {
    result.monsterType = values.monsterType['@id']
  }

  if (values.monsterEffects && values.monsterEffects.length > 0) {
    result.monsterEffects = values.monsterEffects.map((monsterEffect) => monsterEffect['@id'])
  }

  if (values.tags && values.tags.length > 0) {
    result.tags = values.tags.map((tag) => tag['@id'])
  }

  return result
}

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const { submitError, submit } = useSubmit()
const isEdit = computed(() => !!props.abstractCard)

function onReset() {
  submitError.value = null
}

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload: AbstractCardForm = processValues(values as unknown as AbstractCard)

  let abstractCard: AbstractCard | null = null
  const saved = await submit(async () => {
    if (isEdit.value) {
      abstractCard = await store.update(props.abstractCard.id, payload)
    } else {
      abstractCard = await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('abstractCardSaved', abstractCard)
  modal.value?.finish(isEdit.value)
}

const emit = defineEmits(['abstractCardSaved'])

onMounted(async () => {
  cardSubTypes.value = await cardSubTypesStore.fetchAll()
  monsterAttributes.value = await monsterAttributesStore.fetchAll()
  monsterSubTypes.value = await monsterSubTypesStore.fetchAll()
  monsterTypes.value = await monsterTypesStore.fetchAll()
  monsterEffects.value = await monsterEffectsStore.fetchAll()
})

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="abstractCardModal"
    title="d'une carte abstraite"
    add-other-label="Ajouter une autre carte abstraite"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.abstractCard?.name ?? '',
      level: props.abstractCard?.level ?? undefined,
      atk: props.abstractCard?.atk ?? undefined,
      def: props.abstractCard?.def ?? undefined,
      bluePendulum: props.abstractCard?.bluePendulum ?? undefined,
      redPendulum: props.abstractCard?.redPendulum ?? undefined,
      cardSubType: props.abstractCard?.cardSubType ?? undefined,
      cardGroup: props.abstractCard?.cardGroup ?? undefined,
      monsterAttribute: props.abstractCard?.monsterAttribute ?? undefined,
      monsterSubType: props.abstractCard?.monsterSubType ?? undefined,
      monsterType: props.abstractCard?.monsterType ?? undefined,
      monsterEffects: props.abstractCard?.monsterEffects ?? [],
      tags: props.abstractCard?.tags ?? [],
    }"
    :form-key="props.abstractCard?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="onReset"
  >
    <div class="mb-3">
      <label class="form-label">Nom</label>
      <Field name="name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label">Niveau / Rang / Lien</label>
      <Field name="level" type="number" class="form-control" />
      <ErrorMessage name="level" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label">Atk</label>
      <Field name="atk" type="number" class="form-control" />
      <ErrorMessage name="atk" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label">Def</label>
      <Field name="def" type="number" class="form-control" />
      <ErrorMessage name="def" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label">Pendulum Bleu</label>
      <Field name="bluePendulum" type="number" class="form-control" />
      <ErrorMessage name="bluePendulum" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label">Pendulum Rouge</label>
      <Field name="redPendulum" type="number" class="form-control" />
      <ErrorMessage name="redPendulum" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="cardSubType" v-slot="{ field }">
        <label class="form-label">Sous-Type de carte</label>
        <multi-select
          v-model="field.value"
          :options="cardSubTypes"
          label="name"
          track-by="id"
          placeholder="Choisir un sous-type de carte"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="cardSubType" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="cardGroup" v-slot="{ field }">
        <label class="form-label">Groupe de cartes</label>
        <multi-select
          v-model="field.value"
          :options="cardGroups"
          :searchable="true"
          :loading="cardGroupLoading"
          :internal-search="false"
          :close-on-select="true"
          placeholder="Choisir un groupe de cartes"
          label="name"
          track-by="id"
          @search-change="fetchCardGroups"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="cardGroup" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="monsterAttribute" v-slot="{ field }">
        <label class="form-label">Attribut de monstre</label>
        <multi-select
          v-model="field.value"
          :options="monsterAttributes"
          label="name"
          track-by="id"
          placeholder="Choisir un attribut de monstre"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="monsterAttribute" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="monsterSubType" v-slot="{ field }">
        <label class="form-label">Sous-Type de monstre</label>
        <multi-select
          v-model="field.value"
          :options="monsterSubTypes"
          label="name"
          track-by="id"
          placeholder="Choisir un sous-type de monstre"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="monsterSubType" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="monsterType" v-slot="{ field }">
        <label class="form-label">Type de monstre</label>
        <multi-select
          v-model="field.value"
          :options="monsterTypes"
          label="name"
          track-by="id"
          placeholder="Choisir un type de monstre"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="monsterType" class="text-danger small" />
    </div>
    <div class="mb-3">
      <Field name="tags" v-slot="{ field }">
        <label class="form-label">Tags</label>
        <multi-select
          v-model="field.value"
          :options="tags"
          multiple
          :taggable="true"
          :loading="tagLoading"
          :internal-search="false"
          placeholder="Choisissez un ou plusieurs tags"
          label="name"
          track-by="id"
          @tag="createTag"
          @search-change="fetchTags"
        />
      </Field>
      <ErrorMessage name="tags" class="text-danger small" />
    </div>
  </FormModal>
</template>
