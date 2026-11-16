<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { cardPriceLabel } from '@/helpers/card'
import { useCardPricesStore, useCardsStore, useRaritiesStore } from '@/stores'
import type { Card } from '@/types/models/Card'
import type { CardPrice } from '@/types/models/CardPrice'
import type { Rarity } from '@/types/models/Rarity'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, onMounted, ref, useTemplateRef, type PropType } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  cardPrice: { type: Object as PropType<CardPrice>, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useCardPricesStore()
const cardsStore = useCardsStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.cardPrice)
const cards = ref<Card[]>([])
const cardsLoading = ref(false)
const allRarities = ref<Rarity[]>([])

onMounted(async () => {
  allRarities.value = await useRaritiesStore().fetchAll()
})

/** Raretés proposées : celles de l'impression choisie, toutes à défaut */
function raritiesOf(card: Card | null | undefined): Rarity[] {
  return card?.rarities?.length ? card.rarities : allRarities.value
}

const amount = yup
  .number()
  .typeError('Prix requis')
  .min(0, 'Le prix ne peut pas être négatif')
  .required('Prix requis')

const schema = computed(() =>
  isEdit.value
    ? yup.object({ amount })
    : yup.object({
        card: yup.object().nullable().required('Carte requise'),
        rarity: yup.string().required('Rareté requise'),
        amount,
      }),
)

/** Deux décimales, comme l'API */
const toAmount = (value: unknown) => Math.round(Number(value) * 100) / 100

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.cardPrice.id, { amount: toAmount(values.amount) })
    } else {
      await store.create({
        card: (values.card as Card)['@id'],
        rarity: values.rarity as string,
        amount: toAmount(values.amount),
      })
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
    cards.value = await cardsStore.autocomplete(query)
  } finally {
    cardsLoading.value = false
  }
}

const cardOptionLabel = (card: Card) => `${card.name} (${card.reference})`

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="cardPriceModal"
    title="d'un prix de référence"
    add-other-label="Ajouter un autre prix"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      card: null,
      rarity: '',
      amount: props.cardPrice?.amount ?? '',
    }"
    :form-key="props.cardPrice?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
    v-slot="{ values, setFieldValue }"
  >
    <template v-if="isEdit">
      <div class="mb-3">
        <div class="form-label">Carte</div>
        <div data-test="card">{{ cardPriceLabel(props.cardPrice.card) }}</div>
      </div>
      <div class="mb-3">
        <div class="form-label">Rareté</div>
        <div>{{ props.cardPrice.rarity.name }}</div>
      </div>
    </template>
    <template v-else>
      <div class="mb-3">
        <Field name="card" v-slot="{ field }">
          <label class="form-label" for="cardPriceModal-card">Carte</label>
          <multi-select
            id="cardPriceModal-card"
            :model-value="field.value"
            :options="cards"
            :searchable="true"
            :internal-search="false"
            :loading="cardsLoading"
            :custom-label="cardOptionLabel"
            track-by="id"
            placeholder="Rechercher une carte"
            @search-change="searchCards"
            @update:model-value="
              (card: Card | null) => {
                field.onChange(card)
                setFieldValue('rarity', '')
              }
            "
          />
        </Field>
        <ErrorMessage name="card" class="text-danger small" />
      </div>
      <div class="mb-3">
        <label class="form-label" for="cardPriceModal-rarity">Rareté</label>
        <Field name="rarity" id="cardPriceModal-rarity" as="select" class="form-select">
          <option value="">Choisir une rareté</option>
          <option
            v-for="rarity in raritiesOf(values.card as Card | null)"
            :key="rarity['@id']"
            :value="rarity['@id']"
          >
            {{ rarity.name }}
          </option>
        </Field>
        <ErrorMessage name="rarity" class="text-danger small" />
      </div>
    </template>
    <div class="mb-3">
      <label class="form-label" for="cardPriceModal-amount">Prix (€)</label>
      <Field
        name="amount"
        id="cardPriceModal-amount"
        type="number"
        step="0.01"
        min="0"
        class="form-control"
      />
      <ErrorMessage name="amount" class="text-danger small" />
      <div class="form-text">
        Valeur d'un exemplaire non gradé, utilisée dans les échanges quand le joueur n'a pas fixé la
        sienne. Chaque changement ajoute un point à l'historique.
      </div>
    </div>
  </FormModal>
</template>
