<script setup lang="ts">
import AppPaginator from '@/components/AppPaginator.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { useListView } from '@/composables/useListView'
import { formatDateTime } from '@/helpers/date'
import { useTradesStore } from '@/stores'
import type { Trade } from '@/types/models/Trade'
import { TRADE_STATUS_LABELS } from '@/types/models/Trade'
import { ref } from 'vue'
import TradeModal from './modals/TradeModal.vue'

const store = useTradesStore()
const modalRef = ref<InstanceType<typeof TradeModal> | null>(null)
const selected = ref<Trade | null>(null)

const {
  items,
  loading,
  pagination,
  currentPage,
  sort,
  filters,
  nbFilters,
  reload,
  setSort,
  applyFilters,
  resetFilters,
  changePage,
} = useListView(store, {
  sort: { sortBy: 'updatedAt', sortDir: 'desc' },
  createFilters: () => ({
    status: null as string | null,
    proposer: null as string | null,
    recipient: null as string | null,
  }),
})

const STATUS_CLASSES: Record<Trade['status'], string> = {
  negotiating: 'bg-primary',
  accepted: 'bg-info',
  completed: 'bg-success',
  declined: 'bg-secondary',
  cancelled: 'bg-danger',
}

/** Nombre de lignes de la proposition en cours */
const currentLines = (trade: Trade) =>
  (trade.lines ?? []).filter((line) => line.revision === trade.revision).length

function openTrade(trade: Trade) {
  selected.value = trade
  modalRef.value?.showModal()
}
</script>

<template>
  <div class="d-grid gap-2 d-md-flex justify-content-between py-3">
    <h2>Échanges</h2>
    <div>
      <button
        class="btn btn-secondary position-relative"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#filterCollapse"
      >
        <font-awesome-icon :icon="['fa', 'filter']" />
        Filtrer
        <span
          v-if="nbFilters > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        >
          {{ nbFilters }}
        </span>
      </button>
    </div>
  </div>
  <div class="collapse bg-light p-2 my-2" id="filterCollapse">
    <div class="row g-2">
      <div class="col-3">
        <label for="trade_status" class="form-label">Statut</label>
        <select class="form-select" id="trade_status" v-model="filters.status">
          <option :value="null">Tous</option>
          <option v-for="(label, value) in TRADE_STATUS_LABELS" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>
      <div class="col-3">
        <label for="trade_proposer" class="form-label">Proposeur</label>
        <input
          type="text"
          class="form-control"
          id="trade_proposer"
          placeholder="Pseudo..."
          v-model="filters.proposer"
        />
      </div>
      <div class="col-3">
        <label for="trade_recipient" class="form-label">Destinataire</label>
        <input
          type="text"
          class="form-control"
          id="trade_recipient"
          placeholder="Pseudo..."
          v-model="filters.recipient"
        />
      </div>
      <div class="col-3 d-flex flex-column gap-2">
        <button class="btn btn-secondary w-100" @click="resetFilters">
          <font-awesome-icon :icon="['fa', 'clock-rotate-left']" />
          Réinitialiser
        </button>
        <button class="btn btn-primary w-100" @click="applyFilters">
          <font-awesome-icon :icon="['fa', 'check']" />
          Appliquer
        </button>
      </div>
    </div>
  </div>
  <table class="table">
    <thead>
      <tr>
        <SortableHeader field="id" :sort="sort" @sort="setSort">#</SortableHeader>
        <th scope="col">Proposeur</th>
        <th scope="col">Destinataire</th>
        <th scope="col">Statut</th>
        <th scope="col">Au tour de</th>
        <th scope="col">Cartes</th>
        <SortableHeader field="updatedAt" :sort="sort" @sort="setSort">Modifié le</SortableHeader>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody v-if="loading">
      <tr>
        <td colspan="8" class="text-center align-middle">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else-if="items.length">
      <tr v-for="trade in items" :key="trade.id">
        <td>{{ trade.id }}</td>
        <td>{{ trade.proposerName }}</td>
        <td>{{ trade.recipientName }}</td>
        <td>
          <span class="badge" :class="STATUS_CLASSES[trade.status]">
            {{ TRADE_STATUS_LABELS[trade.status] }}
          </span>
          <span v-if="trade.partial" class="badge bg-warning text-dark ms-1">Partiel</span>
        </td>
        <td>{{ trade.turnName ?? '—' }}</td>
        <td>{{ currentLines(trade) }}</td>
        <td>{{ formatDateTime(trade.updatedAt) }}</td>
        <td>
          <button
            class="btn btn-primary"
            aria-label="Détail"
            title="Détail"
            @click="openTrade(trade)"
          >
            <font-awesome-icon :icon="['fa', 'eye']" />
          </button>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="8"><em>Aucun échange</em></td>
      </tr>
    </tbody>
    <tfoot v-if="pagination.totalItems > 50">
      <tr>
        <td colspan="8" class="text-center pt-3 pb-0">
          <AppPaginator
            :pagination="pagination"
            :current-page="currentPage"
            @page-changed="changePage"
          />
        </td>
      </tr>
    </tfoot>
  </table>
  <TradeModal ref="modalRef" :trade="selected" @cancelled="reload" />
</template>
