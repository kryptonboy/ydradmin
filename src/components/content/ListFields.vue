<script setup lang="ts">
import { moveItem } from '@/helpers/content-blocks'
import type { ListBlock } from '@/types/content-blocks'
import RichTextEditor from './RichTextEditor.vue'

defineProps<{ uid: string; hasError: (field: string) => boolean }>()

const block = defineModel<ListBlock>({ required: true })

function add() {
  block.value.items.push('')
}

function remove(index: number) {
  block.value.items.splice(index, 1)
}

function move(index: number, to: number) {
  block.value.items = moveItem(block.value.items, index, to)
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div class="form-check form-switch">
      <input
        :id="`${uid}-ordered`"
        v-model="block.ordered"
        class="form-check-input"
        type="checkbox"
        role="switch"
      />
      <label class="form-check-label" :for="`${uid}-ordered`">Liste numérotée</label>
    </div>
    <div v-for="(_, index) in block.items" :key="index" class="d-flex gap-2 align-items-start">
      <span class="text-muted small pt-2" style="min-width: 1.5rem">
        {{ block.ordered ? `${index + 1}.` : '•' }}
      </span>
      <div class="flex-grow-1">
        <RichTextEditor
          v-model="block.items[index]"
          variant="minimal"
          :invalid="hasError(`items[${index}]`)"
        />
      </div>
      <div class="btn-group btn-group-sm">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="index === 0"
          aria-label="Monter l'élément"
          @click="move(index, index - 1)"
        >
          <font-awesome-icon :icon="['fa', 'arrow-up']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="index === block.items.length - 1"
          aria-label="Descendre l'élément"
          @click="move(index, index + 1)"
        >
          <font-awesome-icon :icon="['fa', 'arrow-down']" />
        </button>
        <button
          type="button"
          class="btn btn-outline-danger"
          :disabled="block.items.length <= 1"
          aria-label="Supprimer l'élément"
          @click="remove(index)"
        >
          <font-awesome-icon :icon="['fa', 'trash']" />
        </button>
      </div>
    </div>
    <div>
      <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter un élément
      </button>
    </div>
  </div>
</template>
