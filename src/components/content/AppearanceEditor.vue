<script setup lang="ts">
import { getErrorMessage } from '@/helpers/api-error'
import { mediaUrl } from '@/helpers/media'
import {
  useAbstractCardsStore,
  useChapterCharactersStore,
  useCharactersStore,
  useEpisodeCharactersStore,
} from '@/stores'
import type { Appearance } from '@/types/models/Appearance'
import type { Character } from '@/types/models/Character'
import { computed, ref } from 'vue'

type CardOption = { '@id'?: string; id: number; name?: string }

const props = defineProps<{
  /** `episode` ou `chapter` : détermine la ressource d'apparition utilisée */
  kind: 'episode' | 'chapter'
  /** IRI de l'épisode ou du chapitre */
  parentIri: string
  appearances: Appearance[]
}>()

const emit = defineEmits<{ changed: [] }>()

const store = props.kind === 'episode' ? useEpisodeCharactersStore() : useChapterCharactersStore()
const charactersStore = useCharactersStore()
const cardsStore = useAbstractCardsStore()

const error = ref<string | null>(null)
const busy = ref(false)

// Ajout d'un personnage
const newCharacter = ref<Character | null>(null)
const newCards = ref<CardOption[]>([])
const characterOptions = ref<Character[]>([])
const cardOptions = ref<CardOption[]>([])
const charactersLoading = ref(false)
const cardsLoading = ref(false)

// Modification des cartes d'un personnage déjà présent
const editingId = ref<number | null>(null)
const editCards = ref<CardOption[]>([])

// Un personnage n'apparaît qu'une fois : on masque ceux déjà ajoutés
const availableCharacters = computed(() =>
  characterOptions.value.filter((c) => !props.appearances.some((a) => a.character.id === c.id)),
)

const cardIri = (card: CardOption) => card['@id'] ?? `/api/abstract_cards/${card.id}`

async function searchCharacters(query: string) {
  charactersLoading.value = true
  characterOptions.value = await charactersStore.autocomplete(query)
  charactersLoading.value = false
}

async function searchCards(query: string) {
  cardsLoading.value = true
  cardOptions.value = (await cardsStore.autocomplete(query)) as CardOption[]
  cardsLoading.value = false
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
  if (!newCharacter.value) return
  const ok = await run(() =>
    store.create({
      [props.kind]: props.parentIri,
      character: newCharacter.value!['@id'],
      cards: newCards.value.map(cardIri),
    } as never),
  )
  if (ok) {
    newCharacter.value = null
    newCards.value = []
  }
}

function startEdit(appearance: Appearance) {
  editingId.value = appearance.id
  editCards.value = [...(appearance.cards ?? [])]
}

async function saveCards(appearance: Appearance) {
  const ok = await run(() => store.update(appearance.id, { cards: editCards.value.map(cardIri) }))
  if (ok) editingId.value = null
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
      <li v-for="appearance in appearances" :key="appearance.id" class="list-group-item">
        <div class="d-flex align-items-center gap-3">
          <img
            v-if="mediaUrl(appearance.character.photo?.contentUrl)"
            :src="mediaUrl(appearance.character.photo?.contentUrl) ?? undefined"
            :alt="`Photo de ${appearance.character.name}`"
            class="rounded"
            style="height: 3rem; width: 3rem; object-fit: cover"
          />
          <div class="flex-grow-1">
            <strong>{{ appearance.character.name }}</strong>
            <div v-if="editingId !== appearance.id" class="small">
              <span v-if="!appearance.cards?.length" class="text-muted">Aucune carte</span>
              <span
                v-for="card in appearance.cards"
                :key="card.id"
                class="badge text-bg-secondary me-1"
              >
                {{ card.name ?? `#${card.id}` }}
              </span>
            </div>
          </div>
          <div v-if="editingId !== appearance.id" class="btn-group btn-group-sm">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="busy"
              aria-label="Modifier les cartes"
              title="Modifier les cartes"
              @click="startEdit(appearance)"
            >
              <font-awesome-icon :icon="['fa', 'pencil']" />
            </button>
            <button
              type="button"
              class="btn btn-outline-danger"
              :disabled="busy"
              aria-label="Retirer le personnage"
              title="Retirer le personnage"
              @click="remove(appearance)"
            >
              <font-awesome-icon :icon="['fa', 'trash']" />
            </button>
          </div>
        </div>
        <div v-if="editingId === appearance.id" class="mt-2">
          <label class="form-label" :for="`cards-${appearance.id}`">Cartes utilisées</label>
          <multi-select
            :id="`cards-${appearance.id}`"
            v-model="editCards"
            :options="cardOptions"
            :multiple="true"
            :searchable="true"
            :loading="cardsLoading"
            :internal-search="false"
            :close-on-select="false"
            label="name"
            track-by="id"
            placeholder="Rechercher une carte"
            @search-change="searchCards"
          />
          <div class="d-flex gap-2 mt-2">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="busy"
              @click="saveCards(appearance)"
            >
              <font-awesome-icon :icon="['fa', 'floppy-disk']" />
              Enregistrer
            </button>
            <button type="button" class="btn btn-secondary btn-sm" @click="editingId = null">
              <font-awesome-icon :icon="['fa', 'xmark']" />
              Annuler
            </button>
          </div>
        </div>
      </li>
    </ul>
    <p v-else class="text-muted fst-italic">Aucun personnage.</p>

    <div class="border rounded p-2">
      <strong class="d-block mb-2">Ajouter un personnage</strong>
      <div class="row g-2">
        <div class="col-md-5">
          <label class="form-label" for="newAppearanceCharacter">Personnage</label>
          <multi-select
            id="newAppearanceCharacter"
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
        <div class="col-md-7">
          <label class="form-label" for="newAppearanceCards">Cartes utilisées</label>
          <multi-select
            id="newAppearanceCards"
            v-model="newCards"
            :options="cardOptions"
            :multiple="true"
            :searchable="true"
            :loading="cardsLoading"
            :internal-search="false"
            :close-on-select="false"
            label="name"
            track-by="id"
            placeholder="Rechercher une carte"
            @search-change="searchCards"
          />
        </div>
      </div>
      <button
        type="button"
        class="btn btn-primary btn-sm mt-2"
        :disabled="!newCharacter || busy"
        @click="add"
      >
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter
      </button>
    </div>
  </div>
</template>
