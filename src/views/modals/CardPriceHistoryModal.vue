<script setup lang="ts">
import { cardPriceLabel } from '@/helpers/card'
import { formatDateTime, fromDateInput } from '@/helpers/date'
import { formatEuros } from '@/helpers/money'
import { useCardPriceHistoriesStore } from '@/stores'
import type { CardPrice } from '@/types/models/CardPrice'
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'

const props = defineProps<{ cardPrice: CardPrice | null }>()

const modalEl = useTemplateRef<HTMLElement>('modalEl')
let modalInstance: bootstrap.Modal | null = null

const store = useCardPriceHistoriesStore()
const since = ref('')

onMounted(() => {
  if (modalEl.value) modalInstance = new bootstrap.Modal(modalEl.value)
})

/** Points du plus ancien au plus récent, avec l'écart au point précédent */
const points = computed(() =>
  store.items.map((point, index) => ({
    ...point,
    delta: index > 0 ? point.amount - store.items[index - 1]!.amount : null,
  })),
)

function load() {
  if (!props.cardPrice) return
  const query: Record<string, string | number> = {
    card: props.cardPrice.card.id ?? props.cardPrice.card['@id'],
    rarity: props.cardPrice.rarity.id ?? props.cardPrice.rarity['@id'],
  }
  const from = fromDateInput(since.value)
  if (from) query['recordedAt[gte]'] = from
  return store.filter(query, { sortBy: 'recordedAt', sortDir: 'asc' }, 1)
}

async function show() {
  since.value = ''
  modalInstance?.show()
  // La prop `cardPrice` est mise à jour au prochain tick
  await nextTick()
  await load()
}

const signed = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatEuros(Math.abs(value))}`

defineExpose({ showModal: show })
</script>

<template>
  <div id="cardPriceHistoryModal" class="modal fade" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Historique du prix</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Fermer"
            @click="modalInstance?.hide()"
          ></button>
        </div>
        <div class="modal-body" v-if="props.cardPrice">
          <p>
            <strong>{{ cardPriceLabel(props.cardPrice.card) }}</strong> —
            {{ props.cardPrice.rarity.name }}<br />
            Prix actuel : {{ formatEuros(props.cardPrice.amount) }}
          </p>
          <form class="d-flex gap-2 align-items-end mb-3" @submit.prevent="load">
            <div>
              <label class="form-label" for="cardPriceHistory_since">Depuis le</label>
              <input id="cardPriceHistory_since" v-model="since" type="date" class="form-control" />
            </div>
            <button type="submit" class="btn btn-primary">Afficher</button>
          </form>
          <div v-if="store.error" class="alert alert-danger" role="alert">{{ store.error }}</div>
          <div v-if="store.loading" class="text-center">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <table v-else-if="points.length" class="table table-sm" data-test="history">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col" class="text-end">Prix</th>
                <th scope="col" class="text-end">Écart</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="point in points" :key="point.id">
                <td>{{ formatDateTime(point.recordedAt) }}</td>
                <td class="text-end">{{ formatEuros(point.amount) }}</td>
                <td
                  class="text-end"
                  :class="{
                    'text-success': (point.delta ?? 0) > 0,
                    'text-danger': (point.delta ?? 0) < 0,
                  }"
                >
                  {{ point.delta === null ? '—' : signed(point.delta) }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else-if="!store.error"><em>Aucun point sur la période</em></p>
          <p v-if="store.pagination.totalItems > points.length" class="small text-muted">
            {{ points.length }} premiers points sur {{ store.pagination.totalItems }} : restreignez
            la période pour voir les plus récents.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="modalInstance?.hide()">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
