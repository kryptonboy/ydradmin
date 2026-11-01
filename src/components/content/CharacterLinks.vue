<script setup lang="ts">
import { getErrorMessage } from '@/helpers/api-error'
import { mediaUrl } from '@/helpers/media'
import { useCharactersStore, useVideoGameCharactersStore } from '@/stores'
import type { Appearance } from '@/types/models/Appearance'
import type { Character } from '@/types/models/Character'
import { computed, ref } from 'vue'

const props = defineProps<{
  /** IRI du jeu vidéo */
  parentIri: string
  appearances: Appearance[]
}>()

const emit = defineEmits<{ changed: [] }>()

const store = useVideoGameCharactersStore()
const charactersStore = useCharactersStore()

const error = ref<string | null>(null)
const busy = ref(false)
const newCharacter = ref<Character | null>(null)
const characterOptions = ref<Character[]>([])
const charactersLoading = ref(false)

// Un personnage n'apparaît qu'une fois dans un jeu : on masque ceux déjà ajoutés
const availableCharacters = computed(() =>
  characterOptions.value.filter((c) => !props.appearances.some((a) => a.character.id === c.id)),
)

async function searchCharacters(query: string) {
  charactersLoading.value = true
  characterOptions.value = await charactersStore.autocomplete(query)
  charactersLoading.value = false
}

async function run(action: () => Promise<unknown>): Promise<boolean> {
  error.value = null
  busy.value = true
  try {
    await action()
    emit('changed')
    return true
  } catch (err) {
    error.value = getErrorMessage(err)
    return false
  } finally {
    busy.value = false
  }
}

async function add() {
  const character = newCharacter.value
  if (!character) return
  const ok = await run(() =>
    store.create({ videoGame: props.parentIri, character: character['@id'] }),
  )
  if (ok) newCharacter.value = null
}

function remove(appearance: Appearance) {
  if (!window.confirm(`Retirer « ${appearance.character.name} » ?`)) return
  return run(() => store.remove(appearance.id))
}
</script>

<template>
  <div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <ul v-if="appearances.length" class="list-group mb-3">
      <li
        v-for="appearance in appearances"
        :key="appearance.id"
        class="list-group-item d-flex align-items-center gap-3"
      >
        <img
          v-if="mediaUrl(appearance.character.photo?.contentUrl)"
          :src="mediaUrl(appearance.character.photo?.contentUrl) ?? undefined"
          :alt="`Photo de ${appearance.character.name}`"
          class="rounded"
          style="height: 3rem; width: 3rem; object-fit: cover"
        />
        <strong class="flex-grow-1">{{ appearance.character.name }}</strong>
        <button
          type="button"
          class="btn btn-outline-danger btn-sm"
          :disabled="busy"
          aria-label="Retirer le personnage"
          title="Retirer le personnage"
          @click="remove(appearance)"
        >
          <font-awesome-icon :icon="['fa', 'trash']" />
        </button>
      </li>
    </ul>
    <p v-else class="text-muted fst-italic">Aucun personnage.</p>

    <div class="border rounded p-2">
      <label class="form-label fw-bold" for="newVideoGameCharacter">Ajouter un personnage</label>
      <div class="d-flex gap-2">
        <div class="flex-grow-1">
          <multi-select
            id="newVideoGameCharacter"
            v-model="newCharacter"
            :options="availableCharacters"
            :searchable="true"
            :loading="charactersLoading"
            :internal-search="false"
            :close-on-select="true"
            label="name"
            track-by="id"
            placeholder="Rechercher un personnage"
            @search-change="searchCharacters"
          />
        </div>
        <button
          type="button"
          class="btn btn-primary align-self-start"
          :disabled="!newCharacter || busy"
          @click="add"
        >
          <font-awesome-icon :icon="['fa', 'plus']" />
          Ajouter
        </button>
      </div>
    </div>
  </div>
</template>
