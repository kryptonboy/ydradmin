<script setup lang="ts">
import { moveItem } from '@/helpers/content-blocks'
import type { CarouselBlock } from '@/types/content-blocks'
import MediaPicker from './MediaPicker.vue'

defineProps<{ uid: string; hasError: (field: string) => boolean }>()

const block = defineModel<CarouselBlock>({ required: true })

function add() {
  block.value.images.push({ image: null, title: '', description: '' })
}

function remove(index: number) {
  block.value.images.splice(index, 1)
}

function move(index: number, to: number) {
  block.value.images = moveItem(block.value.images, index, to)
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div v-for="(item, index) in block.images" :key="index" class="border rounded p-2">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong class="small">Image {{ index + 1 }}</strong>
        <div class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="index === 0"
            aria-label="Monter l'image"
            @click="move(index, index - 1)"
          >
            <font-awesome-icon :icon="['fa', 'arrow-up']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="index === block.images.length - 1"
            aria-label="Descendre l'image"
            @click="move(index, index + 1)"
          >
            <font-awesome-icon :icon="['fa', 'arrow-down']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            :disabled="block.images.length <= 1"
            aria-label="Supprimer l'image"
            @click="remove(index)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </div>
      </div>
      <div class="row g-2">
        <div class="col-md-6">
          <MediaPicker
            :id="`${uid}-image-${index}`"
            v-model="item.image"
            label="Fichier"
            context="content_bloc_carousel_image"
            :invalid="hasError(`images[${index}].image`)"
          />
        </div>
        <div class="col-md-6">
          <label class="form-label" :for="`${uid}-title-${index}`">Titre</label>
          <input :id="`${uid}-title-${index}`" v-model="item.title" class="form-control" />
          <label class="form-label mt-2" :for="`${uid}-description-${index}`">Description</label>
          <input
            :id="`${uid}-description-${index}`"
            v-model="item.description"
            class="form-control"
          />
        </div>
      </div>
    </div>
    <div>
      <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter une image
      </button>
    </div>
  </div>
</template>
