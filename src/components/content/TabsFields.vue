<script setup lang="ts">
import { moveItem } from '@/helpers/content-blocks'
import type { EditorBlock, TabContainerBlock } from '@/types/content-blocks'
import { ref } from 'vue'
import BlockEditor from './BlockEditor.vue'

const props = defineProps<{
  uid: string
  /** Chemin du bloc dans les erreurs de l'API (`blocks[1]`) */
  path: string
  depth: number
  hasError: (field: string) => boolean
}>()

const block = defineModel<TabContainerBlock<EditorBlock>>({ required: true })

const active = ref(0)

function add() {
  block.value.tabs.push({ title: '', children: [] })
  active.value = block.value.tabs.length - 1
}

function remove() {
  if (block.value.tabs.length <= 1) return
  block.value.tabs.splice(active.value, 1)
  active.value = Math.min(active.value, block.value.tabs.length - 1)
}

function move(to: number) {
  if (to < 0 || to >= block.value.tabs.length) return
  block.value.tabs = moveItem(block.value.tabs, active.value, to)
  active.value = to
}
</script>

<template>
  <div>
    <ul class="nav nav-tabs" role="tablist">
      <li v-for="(tab, index) in block.tabs" :key="index" class="nav-item" role="presentation">
        <button
          type="button"
          class="nav-link"
          :class="{ active: active === index, 'text-danger': hasError(`tabs[${index}]`) }"
          role="tab"
          :aria-selected="active === index"
          :aria-controls="`${uid}-panel-${index}`"
          @click="active = index"
        >
          {{ tab.title || `Onglet ${index + 1}` }}
        </button>
      </li>
      <li class="nav-item">
        <button type="button" class="nav-link" aria-label="Ajouter un onglet" @click="add">
          <font-awesome-icon :icon="['fa', 'plus']" />
        </button>
      </li>
    </ul>
    <template v-for="(tab, index) in block.tabs" :key="index">
      <div
        v-show="active === index"
        :id="`${uid}-panel-${index}`"
        class="border border-top-0 p-2"
        role="tabpanel"
      >
        <div class="d-flex gap-2 align-items-end mb-2">
          <div class="flex-grow-1">
            <label class="form-label" :for="`${uid}-tab-title-${index}`">Titre de l'onglet</label>
            <input
              :id="`${uid}-tab-title-${index}`"
              v-model="tab.title"
              class="form-control"
              :class="{ 'is-invalid': hasError(`tabs[${index}].title`) }"
            />
          </div>
          <div class="btn-group btn-group-sm mb-1">
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="index === 0"
              aria-label="Déplacer l'onglet vers la gauche"
              @click="move(index - 1)"
            >
              <font-awesome-icon :icon="['fa', 'arrow-up']" />
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="index === block.tabs.length - 1"
              aria-label="Déplacer l'onglet vers la droite"
              @click="move(index + 1)"
            >
              <font-awesome-icon :icon="['fa', 'arrow-down']" />
            </button>
            <button
              type="button"
              class="btn btn-outline-danger"
              :disabled="block.tabs.length <= 1"
              aria-label="Supprimer l'onglet"
              @click="remove"
            >
              <font-awesome-icon :icon="['fa', 'trash']" />
            </button>
          </div>
        </div>
        <BlockEditor
          v-model="tab.children"
          :path="`${props.path}.tabs[${index}].children`"
          :depth="depth + 1"
        />
      </div>
    </template>
  </div>
</template>
