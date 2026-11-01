<script setup lang="ts">
import AppLink from '@/components/AppLink.vue'
import LinkedCharacters from '@/components/content/LinkedCharacters.vue'
import { getErrorMessage } from '@/helpers/api-error'
import { useMangasStore } from '@/stores'
import type { Manga } from '@/types/models/Manga'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useMangasStore()

const mangaId = computed(() => Number(route.params.id))
const manga = ref<Manga | null>(null)
const loading = ref(false)
const loadError = ref<string | null>(null)

async function load() {
  loading.value = true
  loadError.value = null
  manga.value = null
  try {
    manga.value = await store.get(mangaId.value)
  } catch (err) {
    loadError.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

watch(mangaId, load, { immediate: true })
</script>

<template>
  <div class="d-flex justify-content-between align-items-center py-3 flex-wrap gap-2">
    <h2 class="mb-0">Personnages du manga{{ manga ? ` « ${manga.name} »` : '' }}</h2>
    <AppLink to="/anime_manga/manga" class="btn btn-secondary">
      <font-awesome-icon :icon="['fa', 'xmark']" />
      Retour à la liste
    </AppLink>
  </div>

  <div v-if="loadError" class="alert alert-danger" role="alert">{{ loadError }}</div>
  <div v-else-if="loading && !manga" class="text-center py-5">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
  </div>
  <LinkedCharacters
    v-else-if="manga"
    kind="manga"
    :parent-id="manga.id"
    :parent-iri="manga['@id']"
  />
</template>
