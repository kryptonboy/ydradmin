<script setup lang="ts">
import { createFetchWrapper } from '@/helpers'
import { getErrorMessage } from '@/helpers/api-error'
import {
  useArcCharactersStore,
  useAuthStore,
  useCharactersStore,
  useMangaCharactersStore,
} from '@/stores'
import type { PaginatedApiResponse } from '@/types/Api'
import type { ArcCharacter } from '@/types/models/ArcCharacter'
import type { Character } from '@/types/models/Character'
import type { MangaCharacter } from '@/types/models/MangaCharacter'
import { computed, ref, watch } from 'vue'

type Link = Pick<ArcCharacter, 'id' | 'character'> &
  Partial<Pick<MangaCharacter, 'mainCharacter' | 'position'>>

const props = defineProps<{
  /** `manga` : avec personnage principal et position ; `arc` : simple liste de personnages */
  kind: 'manga' | 'arc'
  /** Identifiant du manga ou de l'arc (pour lire la liste) */
  parentId: number
  /** IRI du manga ou de l'arc (pour écrire) */
  parentIri: string
}>()

const isManga = props.kind === 'manga'
const store = isManga ? useMangaCharactersStore() : useArcCharactersStore()
const charactersStore = useCharactersStore()

const links = ref<Link[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const busy = ref(false)

const newCharacter = ref<Character | null>(null)
const newMain = ref(false)
const newPosition = ref(0)
const characterOptions = ref<Character[]>([])
const charactersLoading = ref(false)

const editingId = ref<number | null>(null)
const editMain = ref(false)
const editPosition = ref(0)

// Un personnage n'apparaît qu'une fois : on masque ceux déjà ajoutés
const availableCharacters = computed(() =>
  characterOptions.value.filter((c) => !links.value.some((l) => l.character.id === c.id)),
)

// Les listes ne sont pas dans le détail du manga ou de l'arc : on les lit par filtre
async function load() {
  loading.value = true
  error.value = null
  try {
    const query = isManga
      ? `manga_characters?manga=${props.parentId}&order[position]=asc`
      : `arc_characters?arc=${props.parentId}`
    const data = await createFetchWrapper(useAuthStore()).get<PaginatedApiResponse<Link>>(
      `${import.meta.env.VITE_API_URL}/${query}`,
    )
    links.value = data.member ?? []
  } catch (err) {
    error.value = getErrorMessage(err)
    links.value = []
  } finally {
    loading.value = false
  }
}

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
    await load()
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
    isManga
      ? useMangaCharactersStore().create({
          manga: props.parentIri,
          character: character['@id'],
          mainCharacter: newMain.value,
          position: Number(newPosition.value) || 0,
        })
      : useArcCharactersStore().create({ arc: props.parentIri, character: character['@id'] }),
  )
  if (ok) {
    newCharacter.value = null
    newMain.value = false
    newPosition.value = 0
  }
}

function startEdit(link: Link) {
  editingId.value = link.id
  editMain.value = link.mainCharacter ?? false
  editPosition.value = link.position ?? 0
}

async function saveEdit(link: Link) {
  const ok = await run(() =>
    useMangaCharactersStore().update(link.id, {
      mainCharacter: editMain.value,
      position: Number(editPosition.value) || 0,
    }),
  )
  if (ok) editingId.value = null
}

function remove(link: Link) {
  if (!window.confirm(`Retirer « ${link.character.name} » ?`)) return
  return run(() => store.remove(link.id))
}

watch(() => [props.kind, props.parentId], load, { immediate: true })
</script>

<template>
  <div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <div v-if="loading && !links.length" class="text-muted small">Chargement...</div>
    <ul v-else-if="links.length" class="list-group mb-3">
      <li v-for="link in links" :key="link.id" class="list-group-item">
        <div class="d-flex align-items-center gap-2">
          <strong class="flex-grow-1">
            {{ link.character.name }}
            <span v-if="isManga && link.mainCharacter" class="badge text-bg-primary ms-2">
              Principal
            </span>
            <span v-if="isManga" class="text-muted small ms-2">position {{ link.position }}</span>
          </strong>
          <div v-if="editingId !== link.id" class="btn-group btn-group-sm">
            <button
              v-if="isManga"
              type="button"
              class="btn btn-primary"
              :disabled="busy"
              aria-label="Modifier le personnage"
              title="Modifier"
              @click="startEdit(link)"
            >
              <font-awesome-icon :icon="['fa', 'pencil']" />
            </button>
            <button
              type="button"
              class="btn btn-outline-danger"
              :disabled="busy"
              aria-label="Retirer le personnage"
              title="Retirer"
              @click="remove(link)"
            >
              <font-awesome-icon :icon="['fa', 'trash']" />
            </button>
          </div>
        </div>
        <div v-if="editingId === link.id" class="row g-2 mt-1 align-items-end">
          <div class="col-md-3">
            <label class="form-label" :for="`linked-position-${link.id}`">Position</label>
            <input
              :id="`linked-position-${link.id}`"
              v-model.number="editPosition"
              type="number"
              min="0"
              class="form-control"
            />
          </div>
          <div class="col-md-5">
            <div class="form-check form-switch">
              <input
                :id="`linked-main-${link.id}`"
                v-model="editMain"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" :for="`linked-main-${link.id}`">
                Personnage principal
              </label>
            </div>
          </div>
          <div class="col-md-4 d-flex gap-2">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="busy"
              @click="saveEdit(link)"
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
      <div class="row g-2 align-items-end">
        <div :class="isManga ? 'col-md-5' : 'col-md-9'">
          <label class="form-label fw-bold" :for="`newLinkedCharacter-${kind}`">
            Ajouter un personnage
          </label>
          <multi-select
            :id="`newLinkedCharacter-${kind}`"
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
        <template v-if="isManga">
          <div class="col-md-2">
            <label class="form-label" :for="`newLinkedPosition-${kind}`">Position</label>
            <input
              :id="`newLinkedPosition-${kind}`"
              v-model.number="newPosition"
              type="number"
              min="0"
              class="form-control"
            />
          </div>
          <div class="col-md-3">
            <div class="form-check form-switch">
              <input
                :id="`newLinkedMain-${kind}`"
                v-model="newMain"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" :for="`newLinkedMain-${kind}`">Principal</label>
            </div>
          </div>
        </template>
        <div class="col-md-2">
          <button
            type="button"
            class="btn btn-primary w-100"
            :disabled="!newCharacter || busy"
            @click="add"
          >
            <font-awesome-icon :icon="['fa', 'plus']" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
