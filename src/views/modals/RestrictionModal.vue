<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useCardGroupsStore, useGameFormatsStore, useRestrictionsStore } from '@/stores'
import type { RestrictionForm } from '@/types/forms/RestrictionForm'
import type { CardGroup } from '@/types/models/CardGroup'
import type { GameFormat } from '@/types/models/GameFormat'
import { LIMIT_LABELS } from '@/types/models/Restriction'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  restriction: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useRestrictionsStore()
const cardGroupsStore = useCardGroupsStore()
const gameFormatsStore = useGameFormatsStore()
const { submitError, submit } = useSubmit()

const gameFormats = ref<GameFormat[]>([])
const cardGroups = ref<CardGroup[]>([])
const cardGroupLoading = ref(false)
const isEdit = computed(() => !!props.restriction)

const schema = yup.object({
  cardGroup: yup.object({ id: yup.string().required() }).nullable().required('Groupe requis'),
  gameFormat: yup.string().required('Format requis'),
  limitNumber: yup.number().typeError('Limite requise').oneOf([0, 1, 2]).required('Limite requise'),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload: RestrictionForm = {
    cardGroup: (values.cardGroup as CardGroup)['@id'],
    gameFormat: values.gameFormat as string,
    limitNumber: Number(values.limitNumber),
  }
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.restriction.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('saved')
  modal.value?.finish(isEdit.value)
}

async function fetchCardGroups(query: string) {
  cardGroupLoading.value = true
  cardGroups.value = await cardGroupsStore.autocomplete(query)
  cardGroupLoading.value = false
}

onMounted(async () => {
  gameFormats.value = await gameFormatsStore.fetchAll()
})

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="restrictionModal"
    title="d'une restriction"
    add-other-label="Ajouter une autre restriction"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      cardGroup: props.restriction?.cardGroup ?? null,
      gameFormat: props.restriction?.gameFormat?.['@id'] ?? '',
      limitNumber: props.restriction?.limitNumber ?? 1,
    }"
    :form-key="props.restriction?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <Field name="cardGroup" v-slot="{ field }">
        <label class="form-label" for="restrictionModal-cardGroup">Groupe de cartes</label>
        <multi-select
          id="restrictionModal-cardGroup"
          v-model="field.value"
          :options="cardGroups"
          :searchable="true"
          :loading="cardGroupLoading"
          :internal-search="false"
          :close-on-select="true"
          label="name"
          track-by="id"
          placeholder="Rechercher un groupe de cartes"
          @search-change="fetchCardGroups"
          @update:model-value="field.onChange"
        />
      </Field>
      <ErrorMessage name="cardGroup" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="restrictionModal-gameFormat">Format de jeu</label>
      <Field name="gameFormat" id="restrictionModal-gameFormat" as="select" class="form-select">
        <option value="">Choisir un format</option>
        <option v-for="format in gameFormats" :key="format.id" :value="format['@id']">
          {{ format.name }}
        </option>
      </Field>
      <ErrorMessage name="gameFormat" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="restrictionModal-limitNumber">Exemplaires autorisés</label>
      <Field name="limitNumber" id="restrictionModal-limitNumber" as="select" class="form-select">
        <option v-for="(label, limit) in LIMIT_LABELS" :key="limit" :value="Number(limit)">
          {{ label }}
        </option>
      </Field>
      <ErrorMessage name="limitNumber" class="text-danger small" />
    </div>
  </FormModal>
</template>
