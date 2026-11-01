<script setup lang="ts">
import { createFetchWrapper } from '@/helpers'
import { getErrorMessage } from '@/helpers/api-error'
import { useAuthStore } from '@/stores'
import type { UsedCard } from '@/types/models/Appearance'
import { ref, watch } from 'vue'

const props = defineProps<{
  /** Chemin de la ressource, ex. `episodes` */
  resource: string
  id: number
  /** Change quand les apparitions changent : recharge la liste */
  version?: number
}>()

const cards = ref<UsedCard[]>([])
const error = ref<string | null>(null)

// Route hors OpenAPI : `GET /{ressource}/{id}/cards`, cartes dédoublonnées avec leur compteur
async function load() {
  error.value = null
  try {
    const url = `${import.meta.env.VITE_API_URL}/${props.resource}/${props.id}/cards`
    const data = await createFetchWrapper(useAuthStore()).get<{ member?: UsedCard[] }>(url)
    cards.value = data.member ?? []
  } catch (err) {
    error.value = getErrorMessage(err)
    cards.value = []
  }
}

watch(() => [props.resource, props.id, props.version], load, { immediate: true })
</script>

<template>
  <div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <p v-else-if="!cards.length" class="text-muted fst-italic mb-0">Aucune carte utilisée.</p>
    <ul v-else class="list-unstyled mb-0">
      <li v-for="card in cards" :key="card.id">
        {{ card.name }}
        <span class="badge text-bg-light border ms-1" :title="`${card.usageCount} apparition(s)`">
          × {{ card.usageCount }}
        </span>
      </li>
    </ul>
  </div>
</template>
