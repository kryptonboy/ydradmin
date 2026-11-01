<script setup lang="ts">
import { createFetchWrapper } from '@/helpers'
import { ApiError, getErrorMessage } from '@/helpers/api-error'
import { useBlockContent } from '@/composables/useBlockContent'
import { useAuthStore } from '@/stores'
import type { Block, MediaMap } from '@/types/content-blocks'
import { ref, watch } from 'vue'
import BlockEditor from './BlockEditor.vue'

const props = defineProps<{
  /** Chemin de la ressource, ex. `animes`, `mangas`, `characters` */
  resource: string
  id: number
}>()

const content = useBlockContent()
const loading = ref(false)
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

const url = () => `${import.meta.env.VITE_API_URL}/${props.resource}/${props.id}`
const api = () => createFetchWrapper(useAuthStore())

async function load() {
  loading.value = true
  error.value = null
  saved.value = false
  content.clear()
  try {
    const data = await api().get<{ blocks?: Block[]; media?: MediaMap }>(url())
    content.load(data.blocks, data.media)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

// Seul le contenu est envoyé : les autres champs de la fiche restent inchangés
async function save() {
  saving.value = true
  saved.value = false
  error.value = null
  content.blockErrors.value = {}
  try {
    await api().patch(url(), { blocks: content.toPayload() })
    // Le serveur renvoie le HTML nettoyé : on recharge pour afficher ce qui est enregistré
    await load()
    saved.value = true
  } catch (err) {
    error.value = getErrorMessage(err)
    if (err instanceof ApiError) content.splitViolations(err.violations)
  } finally {
    saving.value = false
  }
}

watch(() => [props.resource, props.id], load, { immediate: true })
</script>

<template>
  <section class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <div>
        <strong>Contenu</strong>
        <span class="text-muted small ms-2">{{ content.blockCount.value }} bloc(s)</span>
      </div>
      <button
        type="button"
        class="btn btn-primary btn-sm"
        :disabled="saving || loading"
        @click="save"
      >
        <font-awesome-icon
          :icon="saving ? ['fas', 'spinner'] : ['fa', 'floppy-disk']"
          :spin="saving"
        />
        Enregistrer le contenu
      </button>
    </div>
    <div class="card-body">
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
        <span v-if="content.blockErrorCount.value">
          — {{ content.blockErrorCount.value }} erreur(s) dans le contenu, repérées en rouge.
        </span>
      </div>
      <div v-if="saved" class="alert alert-success" role="status">Contenu enregistré.</div>
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      <BlockEditor v-else v-model="content.blocks.value" path="blocks" />
    </div>
  </section>
</template>
