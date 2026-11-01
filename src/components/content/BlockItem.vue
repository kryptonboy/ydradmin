<script setup lang="ts">
import { errorsUnder } from '@/helpers/content-blocks'
import { BLOCK_LABELS, type EditorBlock } from '@/types/content-blocks'
import { computed, inject, ref, watch } from 'vue'
import BlockEditor from './BlockEditor.vue'
import CarouselFields from './CarouselFields.vue'
import GlossaryFields from './GlossaryFields.vue'
import LinksFields from './LinksFields.vue'
import { blockErrorsKey } from './injection'
import ListFields from './ListFields.vue'
import MediaPicker from './MediaPicker.vue'
import RichTextEditor from './RichTextEditor.vue'
import TabsFields from './TabsFields.vue'

const props = defineProps<{
  /** Chemin du bloc dans les erreurs de l'API, ex. `blocks[2]` */
  path: string
  depth: number
  index: number
  count: number
}>()

const emit = defineEmits<{ remove: []; move: [to: number] }>()

const block = defineModel<EditorBlock>({ required: true })

const errors = inject(blockErrorsKey, ref<Record<string, string>>({}))
const collapsed = ref(false)

const allErrors = computed(() => errorsUnder(errors.value, props.path))
// Les erreurs des blocs enfants sont affichées dans ces blocs
const ownErrors = computed(() =>
  Object.entries(allErrors.value)
    .filter(([key]) => !/\.children\[/.test(key.slice(props.path.length)))
    .map(([key, message]) => ({
      field: key.slice(props.path.length).replace(/^\./, '') || 'bloc',
      message,
    })),
)
const hasAnyError = computed(() => Object.keys(allErrors.value).length > 0)

function hasError(field: string): boolean {
  const prefix = `${props.path}.${field}`
  return ownErrors.value.some(({ field: f }) => `${props.path}.${f}`.startsWith(prefix))
}

watch(hasAnyError, (value) => {
  if (value) collapsed.value = false
})

const summary = computed(() => {
  const b = block.value
  const strip = (html: string) =>
    html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  let text = ''
  switch (b.type) {
    case 'paragraph':
    case 'quote':
    case 'table':
      text = strip(b.content)
      break
    case 'section':
      text = b.title ?? ''
      break
    case 'glossary':
      text = b.title ?? ''
      break
    case 'attachment':
      text = b.name
      break
    case 'video':
      text = b.url
      break
    case 'links':
      text = b.title || `${b.items.length} lien(s)`
      break
    case 'list':
      text = strip(b.items.join(' '))
      break
    case 'carousel':
      text = `${b.images.length} image(s)`
      break
    case 'tab_container':
      text = `${b.tabs.length} onglet(s)`
      break
  }
  return text.length > 80 ? `${text.slice(0, 80)}…` : text
})

function toNumber(event: Event): number | null {
  const value = (event.target as HTMLInputElement).value
  return value === '' ? null : Number(value)
}

function confirmRemove() {
  const b = block.value
  const hasChildren =
    (b.type === 'section' && b.children.length > 0) ||
    (b.type === 'tab_container' && b.tabs.some((tab) => tab.children.length > 0))
  if (hasChildren && !window.confirm('Supprimer ce bloc et tout son contenu ?')) return
  emit('remove')
}
</script>

<template>
  <div class="card block-item" :class="{ 'border-danger': hasAnyError }">
    <div class="card-header d-flex align-items-center gap-2 py-1">
      <button
        type="button"
        class="btn btn-sm btn-light drag-handle"
        style="cursor: grab"
        aria-label="Glisser pour déplacer le bloc"
        title="Glisser pour déplacer"
      >
        <font-awesome-icon :icon="['fa', 'grip-vertical']" />
      </button>
      <button
        type="button"
        class="btn btn-sm btn-link text-decoration-none text-body flex-grow-1 text-start text-truncate"
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      >
        <font-awesome-icon :icon="['fa', collapsed ? 'chevron-right' : 'chevron-down']" />
        <strong class="ms-1">{{ BLOCK_LABELS[block.type] }}</strong>
        <span v-if="collapsed && summary" class="ms-2 text-muted">{{ summary }}</span>
      </button>
      <div class="btn-group btn-group-sm">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="index === 0"
          aria-label="Monter le bloc"
          @click="emit('move', index - 1)"
        >
          <font-awesome-icon :icon="['fa', 'arrow-up']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="index === count - 1"
          aria-label="Descendre le bloc"
          @click="emit('move', index + 1)"
        >
          <font-awesome-icon :icon="['fa', 'arrow-down']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-danger"
          aria-label="Supprimer le bloc"
          @click="confirmRemove"
        >
          <font-awesome-icon :icon="['fa', 'trash']" />
        </button>
      </div>
    </div>

    <div v-show="!collapsed" class="card-body">
      <ul v-if="ownErrors.length" class="text-danger small mb-2 ps-3" role="alert">
        <li v-for="error in ownErrors" :key="error.field">
          <code>{{ error.field }}</code> : {{ error.message }}
        </li>
      </ul>

      <RichTextEditor
        v-if="block.type === 'paragraph'"
        v-model="block.content"
        :invalid="hasError('content')"
      />

      <template v-else-if="block.type === 'quote'">
        <RichTextEditor v-model="block.content" :invalid="hasError('content')" />
        <label class="form-label mt-2" :for="`${block.uid}-author`">Auteur</label>
        <input :id="`${block.uid}-author`" v-model="block.author" class="form-control" />
      </template>

      <div v-else-if="block.type === 'image'" class="row g-2">
        <div class="col-md-6">
          <MediaPicker
            :id="`${block.uid}-image`"
            v-model="block.image"
            label="Image"
            context="content_bloc_image"
            :invalid="hasError('image')"
          />
        </div>
        <div class="col-md-6">
          <label class="form-label" :for="`${block.uid}-title`">Titre</label>
          <input :id="`${block.uid}-title`" v-model="block.title" class="form-control" />
          <label class="form-label mt-2" :for="`${block.uid}-alt`">Texte alternatif</label>
          <input :id="`${block.uid}-alt`" v-model="block.alt" class="form-control" />
        </div>
      </div>

      <CarouselFields
        v-else-if="block.type === 'carousel'"
        v-model="block"
        :uid="block.uid"
        :has-error="hasError"
      />

      <div v-else-if="block.type === 'attachment'" class="row g-2">
        <div class="col-md-6">
          <MediaPicker
            :id="`${block.uid}-attachment`"
            v-model="block.attachment"
            label="Fichier"
            context="content_bloc_attachment"
            accept="*/*"
            :invalid="hasError('attachment')"
          />
        </div>
        <div class="col-md-6">
          <label class="form-label" :for="`${block.uid}-name`">Nom</label>
          <input
            :id="`${block.uid}-name`"
            v-model="block.name"
            class="form-control"
            :class="{ 'is-invalid': hasError('name') }"
          />
          <label class="form-label mt-2" :for="`${block.uid}-description`">Description</label>
          <input
            :id="`${block.uid}-description`"
            v-model="block.description"
            class="form-control"
          />
        </div>
      </div>

      <ListFields
        v-else-if="block.type === 'list'"
        v-model="block"
        :uid="block.uid"
        :has-error="hasError"
      />

      <GlossaryFields
        v-else-if="block.type === 'glossary'"
        v-model="block"
        :uid="block.uid"
        :has-error="hasError"
      />

      <LinksFields
        v-else-if="block.type === 'links'"
        v-model="block"
        :uid="block.uid"
        :has-error="hasError"
      />

      <div v-else-if="block.type === 'map'" class="row g-2">
        <div class="col-md-6">
          <label class="form-label" :for="`${block.uid}-latitude`">Latitude (-90 à 90)</label>
          <input
            :id="`${block.uid}-latitude`"
            type="number"
            step="any"
            min="-90"
            max="90"
            class="form-control"
            :class="{ 'is-invalid': hasError('latitude') }"
            :value="block.latitude ?? ''"
            @input="block.latitude = toNumber($event)"
          />
        </div>
        <div class="col-md-6">
          <label class="form-label" :for="`${block.uid}-longitude`">Longitude (-180 à 180)</label>
          <input
            :id="`${block.uid}-longitude`"
            type="number"
            step="any"
            min="-180"
            max="180"
            class="form-control"
            :class="{ 'is-invalid': hasError('longitude') }"
            :value="block.longitude ?? ''"
            @input="block.longitude = toNumber($event)"
          />
        </div>
      </div>

      <RichTextEditor
        v-else-if="block.type === 'table'"
        v-model="block.content"
        variant="table"
        :invalid="hasError('content')"
      />

      <div v-else-if="block.type === 'video'">
        <label class="form-label" :for="`${block.uid}-url`">Adresse de la vidéo</label>
        <input
          :id="`${block.uid}-url`"
          v-model="block.url"
          type="url"
          class="form-control"
          :class="{ 'is-invalid': hasError('url') }"
          placeholder="https://"
        />
      </div>

      <template v-else-if="block.type === 'section'">
        <div class="row g-2 align-items-end mb-2">
          <div class="col-md-8">
            <label class="form-label" :for="`${block.uid}-title`">Titre</label>
            <input :id="`${block.uid}-title`" v-model="block.title" class="form-control" />
          </div>
          <div class="col-md-4">
            <div class="form-check form-switch">
              <input
                :id="`${block.uid}-spoiler`"
                v-model="block.spoiler"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" :for="`${block.uid}-spoiler`">
                Repliée par défaut
              </label>
            </div>
          </div>
        </div>
        <div class="border-start border-3 ps-2">
          <BlockEditor v-model="block.children" :path="`${path}.children`" :depth="depth + 1" />
        </div>
      </template>

      <TabsFields
        v-else-if="block.type === 'tab_container'"
        v-model="block"
        :uid="block.uid"
        :path="path"
        :depth="depth"
        :has-error="hasError"
      />
    </div>
  </div>
</template>
