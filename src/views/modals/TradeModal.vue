<script setup lang="ts">
import { createFetchWrapper } from '@/helpers'
import { getErrorMessage } from '@/helpers/api-error'
import { formatDateTime } from '@/helpers/date'
import { useAuthStore } from '@/stores'
import type { PaginatedApiResponse } from '@/types/Api'
import type { Trade, TradeLine, TradeMessage, TradeRating } from '@/types/models/Trade'
import { TRADE_STATUS_LABELS } from '@/types/models/Trade'
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'

const props = defineProps<{ trade: Trade | null }>()
const emit = defineEmits<{ cancelled: [] }>()

const modalEl = useTemplateRef<HTMLElement>('modalEl')
let modalInstance: bootstrap.Modal | null = null

const messages = ref<TradeMessage[]>([])
const ratings = ref<TradeRating[]>([])
const error = ref<string | null>(null)
const loading = ref(false)
const cancelling = ref(false)

onMounted(() => {
  if (modalEl.value) modalInstance = new bootstrap.Modal(modalEl.value)
})

const canCancel = computed(
  () => props.trade?.status === 'negotiating' || props.trade?.status === 'accepted',
)

// Le « Reçu » n'a de sens qu'une fois l'échange conclu
const showReceived = computed(() => props.trade?.partial || props.trade?.status === 'completed')

/** Lignes groupées par révision, la plus récente (proposition en cours) d'abord */
const revisions = computed(() => {
  const groups = new Map<number, TradeLine[]>()
  for (const line of props.trade?.lines ?? []) {
    groups.set(line.revision, [...(groups.get(line.revision) ?? []), line])
  }
  return [...groups.entries()].sort(([a], [b]) => b - a)
})

const euros = (value: number | null | undefined) =>
  value == null ? '—' : `${value.toFixed(2).replace('.', ',')} €`

const conditionLabel = (line: TradeLine) =>
  line.gradingCompany
    ? `${line.gradingCompany.name} ${line.grade ?? ''}`.trim()
    : (line.condition ?? '—')

const isShort = (line: TradeLine) =>
  line.receivedQuantity != null && line.receivedQuantity < line.quantity

async function load() {
  if (!props.trade) return
  loading.value = true
  error.value = null
  messages.value = []
  ratings.value = []
  try {
    const api = createFetchWrapper(useAuthStore())
    const base = import.meta.env.VITE_API_URL
    const id = props.trade.id
    const [msgs, rates] = await Promise.all([
      api.get<PaginatedApiResponse<TradeMessage>>(
        `${base}/trade_messages?trade=${id}&order[id]=asc`,
      ),
      api.get<PaginatedApiResponse<TradeRating>>(`${base}/trade_ratings?trade=${id}`),
    ])
    messages.value = msgs.member ?? []
    ratings.value = rates.member ?? []
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function cancelTrade() {
  if (!props.trade) return
  const { id, proposerName, recipientName } = props.trade
  const question =
    `Annuler l'échange #${id} entre ${proposerName} et ${recipientName} ? ` +
    'Les cartes mises de côté sont libérées et les listes de souhaits restaurées.'
  if (!window.confirm(question)) return
  cancelling.value = true
  error.value = null
  try {
    await createFetchWrapper(useAuthStore()).post(
      `${import.meta.env.VITE_API_URL}/trades/${id}/cancel`,
    )
    emit('cancelled')
    modalInstance?.hide()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    cancelling.value = false
  }
}

async function show() {
  error.value = null
  modalInstance?.show()
  // La prop `trade` est mise à jour au prochain tick
  await nextTick()
  await load()
}

defineExpose({ showModal: show })
</script>

<template>
  <div id="tradeModal" class="modal fade" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Échange #{{ props.trade?.id }} : {{ props.trade?.proposerName }} ⇄
            {{ props.trade?.recipientName }}
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Fermer"
            @click="modalInstance?.hide()"
          ></button>
        </div>
        <div class="modal-body" v-if="props.trade">
          <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
          <p>
            <span class="badge bg-primary">{{ TRADE_STATUS_LABELS[props.trade.status] }}</span>
            <span v-if="props.trade.partial" class="badge bg-warning text-dark ms-1">Partiel</span>
            <span v-if="props.trade.turnName" class="ms-2">
              Au tour de <strong>{{ props.trade.turnName }}</strong>
            </span>
            <span class="ms-2 text-muted small">
              Créé le {{ formatDateTime(props.trade.createdAt) }}, modifié le
              {{ formatDateTime(props.trade.updatedAt) }}
            </span>
          </p>
          <p class="small">
            Confirmation : {{ props.trade.proposerName }}
            {{ props.trade.proposerConfirmed ? '✔' : '…' }} · {{ props.trade.recipientName }}
            {{ props.trade.recipientConfirmed ? '✔' : '…' }}
          </p>
          <p v-if="props.trade.balance" class="small" data-test="balance">
            Valeur indicative de la proposition en cours : {{ props.trade.proposerName }}
            {{ euros(props.trade.balance.proposer) }} · {{ props.trade.recipientName }}
            {{ euros(props.trade.balance.recipient) }} · écart
            {{ euros(props.trade.balance.difference) }}
          </p>

          <h6>Propositions</h6>
          <div v-for="[revision, lines] in revisions" :key="revision" class="mb-3">
            <div class="fw-semibold">
              Proposition {{ revision }}
              <span v-if="revision === props.trade.revision" class="badge bg-info">En cours</span>
            </div>
            <table class="table table-sm mb-0">
              <thead>
                <tr>
                  <th scope="col">Donneur</th>
                  <th scope="col">Carte</th>
                  <th scope="col">Rareté</th>
                  <th scope="col">État</th>
                  <th scope="col">Langue / édition</th>
                  <th scope="col">Quantité</th>
                  <th v-if="showReceived" scope="col">Reçu</th>
                  <th scope="col">Valeur</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in lines" :key="line.id">
                  <td>{{ line.giverName }}</td>
                  <td>
                    {{ line.card.name }}
                    <span class="text-muted small">{{ line.card.reference }}</span>
                  </td>
                  <td>{{ line.rarity.name }}</td>
                  <td>{{ conditionLabel(line) }}</td>
                  <td>{{ line.language }} / {{ line.edition }}</td>
                  <td>{{ line.quantity }}</td>
                  <td v-if="showReceived" :class="{ 'text-danger fw-bold': isShort(line) }">
                    {{ line.receivedQuantity ?? '—' }} / {{ line.quantity }}
                  </td>
                  <td>{{ euros(line.unitValue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h6>Messages</h6>
          <div v-if="loading" class="spinner-border spinner-border-sm" role="status"></div>
          <p v-else-if="!messages.length" class="text-muted"><em>Aucun message</em></p>
          <ul v-else class="list-unstyled" data-test="messages">
            <li v-for="message in messages" :key="message.id" class="mb-2">
              <strong>{{ message.authorName }}</strong>
              <span class="text-muted small"> · {{ formatDateTime(message.createdAt) }}</span>
              <div class="text-break" style="white-space: pre-wrap">{{ message.content }}</div>
            </li>
          </ul>

          <h6>Évaluations</h6>
          <p v-if="!loading && !ratings.length" class="text-muted"><em>Aucune évaluation</em></p>
          <ul v-else class="list-unstyled mb-0" data-test="ratings">
            <li v-for="rating in ratings" :key="rating.id" class="mb-2">
              <strong>{{ rating.raterName }}</strong> → {{ rating.ratedName }} :
              <span class="badge bg-secondary">{{ rating.score }}/5</span>
              <div v-if="rating.comment" class="text-break">{{ rating.comment }}</div>
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="modalInstance?.hide()">
            Fermer
          </button>
          <button
            v-if="canCancel"
            type="button"
            class="btn btn-danger"
            :disabled="cancelling"
            @click="cancelTrade"
          >
            <font-awesome-icon
              :icon="cancelling ? ['fas', 'spinner'] : ['fa', 'ban']"
              :spin="cancelling"
            />
            Annuler l'échange
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
