<script setup lang="ts">
import { moveItem } from '@/helpers/content-blocks'
import type { GlossaryBlock } from '@/types/content-blocks'
import RichTextEditor from './RichTextEditor.vue'

defineProps<{ uid: string; hasError: (field: string) => boolean }>()

const block = defineModel<GlossaryBlock>({ required: true })

function add() {
  block.value.entries.push({ term: '', definition: '' })
}

function remove(index: number) {
  block.value.entries.splice(index, 1)
}

function move(index: number, to: number) {
  block.value.entries = moveItem(block.value.entries, index, to)
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div>
      <label class="form-label" :for="`${uid}-title`">Titre</label>
      <input :id="`${uid}-title`" v-model="block.title" class="form-control" />
    </div>
    <div v-for="(entry, index) in block.entries" :key="index" class="border rounded p-2">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong class="small">Entrée {{ index + 1 }}</strong>
        <div class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="index === 0"
            aria-label="Monter l'entrée"
            @click="move(index, index - 1)"
          >
            <font-awesome-icon :icon="['fa', 'arrow-up']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="index === block.entries.length - 1"
            aria-label="Descendre l'entrée"
            @click="move(index, index + 1)"
          >
            <font-awesome-icon :icon="['fa', 'arrow-down']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            :disabled="block.entries.length <= 1"
            aria-label="Supprimer l'entrée"
            @click="remove(index)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </div>
      </div>
      <label class="form-label" :for="`${uid}-term-${index}`">Terme</label>
      <input
        :id="`${uid}-term-${index}`"
        v-model="entry.term"
        class="form-control mb-2"
        :class="{ 'is-invalid': hasError(`entries[${index}].term`) }"
      />
      <span class="form-label d-block">Définition</span>
      <RichTextEditor
        v-model="entry.definition"
        variant="minimal"
        :invalid="hasError(`entries[${index}].definition`)"
      />
    </div>
    <div>
      <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter une entrée
      </button>
    </div>
  </div>
</template>
