<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import ContentEditor from '@/components/content/ContentEditor.vue'
import { getErrorMessage } from '@/helpers/api-error'
import { useCharactersStore } from '@/stores'
import type { Character } from '@/types/models/Character'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useCharactersStore()

const characterId = computed(() => Number(route.params.id))
const character = ref<Character | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)

async function load() {
  loading.value = true
  loadError.value = null
  character.value = null
  try {
    character.value = await store.get(characterId.value)
  } catch (err) {
    loadError.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

watch(characterId, load, { immediate: true })
</script>

<template>
  <div class="d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
    <h2 class="mb-0">Fiche du personnage{{ character ? ` « ${character.name} »` : '' }}</h2>
    <AppLink to="/anime_manga/character" class="btn btn-secondary">
      <font-awesome-icon :icon="['fa', 'xmark']" />
      Retour à la liste
    </AppLink>
  </div>

  <div v-if="loadError" class="alert alert-danger" role="alert">{{ loadError }}</div>
  <div v-else-if="loading && !character" class="text-center py-5">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
  </div>
  <ContentEditor v-else-if="character" resource="characters" :id="character.id" />
</template>
