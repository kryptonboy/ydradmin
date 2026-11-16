<script setup lang="ts">
import { createFetchWrapper } from '@/helpers'
import { getErrorMessage } from '@/helpers/api-error'
import { useAuthStore } from '@/stores'
import type { CardPriceImportInput } from '@/types/api-types'
import type { CardPriceImportReport } from '@/types/models/CardPrice'
import { computed, onMounted, ref, useTemplateRef } from 'vue'

const emit = defineEmits<{ imported: [] }>()

const modalEl = useTemplateRef<HTMLElement>('modalEl')
let modalInstance: bootstrap.Modal | null = null

const content = ref('')
const fileName = ref<string | null>(null)
const report = ref<CardPriceImportReport | null>(null)
const error = ref<string | null>(null)
const sending = ref(false)

onMounted(() => {
  if (modalEl.value) modalInstance = new bootstrap.Modal(modalEl.value)
})

/** Lignes qui seront enregistrées : lues moins celles en erreur */
const validLines = computed(() =>
  report.value ? report.value.created + report.value.updated + report.value.unchanged : 0,
)

/** L'aperçu porte sur ce contenu : le modifier oblige à en refaire un */
function onContentChange() {
  report.value = null
  error.value = null
}

async function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  fileName.value = file.name
  content.value = await file.text()
  onContentChange()
}

async function send(commit: boolean) {
  sending.value = true
  error.value = null
  try {
    const body: CardPriceImportInput = { content: content.value, commit }
    report.value = await createFetchWrapper(useAuthStore()).post<CardPriceImportReport>(
      `${import.meta.env.VITE_API_URL}/card_prices/import`,
      body,
    )
    if (report.value.committed) emit('imported')
  } catch (err) {
    report.value = null
    error.value = getErrorMessage(err)
  } finally {
    sending.value = false
  }
}

function show() {
  content.value = ''
  fileName.value = null
  onContentChange()
  modalInstance?.show()
}

defineExpose({ showModal: show })
</script>

<template>
  <div id="cardPriceImportModal" class="modal fade" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Import CSV des prix de référence</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Fermer"
            @click="modalInstance?.hide()"
          ></button>
        </div>
        <div class="modal-body">
          <p class="small text-muted">
            Première ligne : en-têtes <code>reference</code>, <code>rarity</code>,
            <code>price</code>, séparés par <code>;</code> ou <code>,</code>. La rareté (son nom)
            peut rester vide si l'impression n'en a qu'une ; le prix est en euros, virgule décimale
            acceptée. 5000 lignes au plus. Un prix existant est remplacé, et chaque changement de
            montant ajoute un point à l'historique.
          </p>
          <div class="mb-3">
            <label class="form-label" for="cardPriceImport_file">Fichier CSV</label>
            <input
              id="cardPriceImport_file"
              type="file"
              accept=".csv,text/csv,text/plain"
              class="form-control"
              @change="onFile"
            />
          </div>
          <div class="mb-3">
            <label class="form-label" for="cardPriceImport_content">
              Contenu{{ fileName ? ` (${fileName})` : '' }}
            </label>
            <textarea
              id="cardPriceImport_content"
              v-model="content"
              rows="8"
              class="form-control font-monospace small"
              placeholder="reference;rarity;price&#10;LOB-FR001;Rare;4,50"
              @input="onContentChange"
            ></textarea>
          </div>
          <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
          <div v-if="report" data-test="report">
            <div
              class="alert"
              :class="report.committed ? 'alert-success' : 'alert-info'"
              role="status"
            >
              <strong>{{
                report.committed ? 'Import enregistré' : 'Aperçu (rien enregistré)'
              }}</strong>
              — {{ report.lines }} ligne(s) lue(s) : {{ report.created }} création(s),
              {{ report.updated }} modification(s), {{ report.unchanged }} inchangée(s),
              {{ report.errors.length }} en erreur.
            </div>
            <table v-if="report.errors.length" class="table table-sm" data-test="errors">
              <thead>
                <tr>
                  <th scope="col">Ligne</th>
                  <th scope="col">Erreur</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lineError in report.errors" :key="lineError.line">
                  <td>{{ lineError.line }}</td>
                  <td>{{ lineError.message }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="report.errors.length && !report.committed" class="small text-muted">
              Les lignes en erreur seront ignorées, les autres enregistrées.
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="modalInstance?.hide()">
            Fermer
          </button>
          <button
            type="button"
            class="btn btn-outline-primary"
            data-test="preview"
            :disabled="sending || !content.trim()"
            @click="send(false)"
          >
            Aperçu
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-test="commit"
            :disabled="sending || !report || report.committed || validLines === 0"
            @click="send(true)"
          >
            <font-awesome-icon v-if="sending" :icon="['fa', 'spinner']" spin />
            Enregistrer {{ report && !report.committed ? validLines : '' }} prix
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
