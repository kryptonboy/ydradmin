<script setup lang="ts">
import { createBlock } from '@/helpers/content-blocks'
import { BLOCK_LABELS, MAX_DEPTH, type BlockType, type EditorBlock } from '@/types/content-blocks'
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import BlockItem from './BlockItem.vue'

const props = withDefaults(
  defineProps<{
    /** Chemin des erreurs de l'API pour cette liste, ex. `blocks` ou `blocks[2].children` */
    path: string
    /** Profondeur d'imbrication (0 = racine) */
    depth?: number
  }>(),
  { depth: 0 },
)

const blocks = defineModel<EditorBlock[]>({ required: true })

// Au-delà de la profondeur maximale, l'API refuse les blocs conteneurs
const types = computed<BlockType[]>(() => {
  const all = Object.keys(BLOCK_LABELS) as BlockType[]
  return props.depth + 1 >= MAX_DEPTH
    ? all.filter((type) => type !== 'section' && type !== 'tab_container')
    : all
})

function add(type: BlockType) {
  blocks.value = [...blocks.value, createBlock(type)]
}

function remove(uid: string) {
  blocks.value = blocks.value.filter((block) => block.uid !== uid)
}

function move(index: number, to: number) {
  if (to < 0 || to >= blocks.value.length) return
  const copy = [...blocks.value]
  const [item] = copy.splice(index, 1)
  copy.splice(to, 0, item)
  blocks.value = copy
}
</script>

<template>
  <div class="block-editor">
    <VueDraggable
      v-model="blocks"
      group="blocks"
      handle=".drag-handle"
      :animation="150"
      ghost-class="block-ghost"
      class="d-flex flex-column gap-2 block-list"
    >
      <BlockItem
        v-for="(block, index) in blocks"
        :key="block.uid"
        v-model="blocks[index]"
        :path="`${path}[${index}]`"
        :depth="depth"
        :index="index"
        :count="blocks.length"
        @remove="remove(block.uid)"
        @move="(to: number) => move(index, to)"
      />
    </VueDraggable>

    <p v-if="!blocks.length" class="text-muted fst-italic small my-2">Aucun bloc.</p>

    <div class="dropdown mt-2">
      <button
        class="btn btn-outline-primary btn-sm dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter un bloc
      </button>
      <ul class="dropdown-menu">
        <li v-for="type in types" :key="type">
          <button type="button" class="dropdown-item" @click="add(type)">
            {{ BLOCK_LABELS[type] }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.block-list:empty {
  min-height: 1rem;
}
.block-ghost {
  opacity: 0.4;
}
</style>
