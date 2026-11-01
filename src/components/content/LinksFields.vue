<script setup lang="ts">
import { moveItem } from '@/helpers/content-blocks'
import { LINK_KINDS, MAX_LINKS, type LinksBlock } from '@/types/content-blocks'

const props = defineProps<{ uid: string; hasError: (field: string) => boolean }>()

const block = defineModel<LinksBlock>({ required: true })

function add() {
  if (block.value.items.length >= MAX_LINKS) return
  block.value.items.push({ title: '', url: '', kind: '', description: '' })
}

function remove(index: number) {
  block.value.items.splice(index, 1)
}

function move(index: number, to: number) {
  block.value.items = moveItem(block.value.items, index, to)
}

const kindListId = `${props.uid}-kinds`
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div>
      <label class="form-label" :for="`${uid}-title`">Titre du bloc</label>
      <input
        :id="`${uid}-title`"
        v-model="block.title"
        class="form-control"
        placeholder="Pour aller plus loin"
      />
    </div>

    <datalist :id="kindListId">
      <option v-for="kind in LINK_KINDS" :key="kind" :value="kind" />
    </datalist>

    <div v-for="(item, index) in block.items" :key="index" class="border rounded p-2">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong class="small">Lien {{ index + 1 }}</strong>
        <div class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="index === 0"
            aria-label="Monter le lien"
            @click="move(index, index - 1)"
          >
            <font-awesome-icon :icon="['fa', 'arrow-up']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="index === block.items.length - 1"
            aria-label="Descendre le lien"
            @click="move(index, index + 1)"
          >
            <font-awesome-icon :icon="['fa', 'arrow-down']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            :disabled="block.items.length <= 1"
            aria-label="Supprimer le lien"
            @click="remove(index)"
          >
            <font-awesome-icon :icon="['fa', 'trash']" />
          </button>
        </div>
      </div>
      <div class="row g-2">
        <div class="col-md-6">
          <label class="form-label" :for="`${uid}-item-title-${index}`">Titre</label>
          <input
            :id="`${uid}-item-title-${index}`"
            v-model="item.title"
            maxlength="255"
            class="form-control"
            :class="{ 'is-invalid': hasError(`items[${index}].title`) }"
          />
        </div>
        <div class="col-md-6">
          <label class="form-label" :for="`${uid}-item-url-${index}`">Adresse</label>
          <input
            :id="`${uid}-item-url-${index}`"
            v-model="item.url"
            type="url"
            class="form-control"
            :class="{ 'is-invalid': hasError(`items[${index}].url`) }"
            placeholder="https://"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label" :for="`${uid}-item-kind-${index}`">Type</label>
          <input
            :id="`${uid}-item-kind-${index}`"
            v-model="item.kind"
            :list="kindListId"
            maxlength="50"
            class="form-control"
            :class="{ 'is-invalid': hasError(`items[${index}].kind`) }"
            placeholder="trailer, article..."
          />
        </div>
        <div class="col-md-8">
          <label class="form-label" :for="`${uid}-item-description-${index}`">Description</label>
          <input
            :id="`${uid}-item-description-${index}`"
            v-model="item.description"
            maxlength="1000"
            class="form-control"
            :class="{ 'is-invalid': hasError(`items[${index}].description`) }"
          />
        </div>
      </div>
    </div>
    <div>
      <button
        type="button"
        class="btn btn-outline-primary btn-sm"
        :disabled="block.items.length >= MAX_LINKS"
        @click="add"
      >
        <font-awesome-icon :icon="['fa', 'plus']" />
        Ajouter un lien
      </button>
      <span v-if="block.items.length >= MAX_LINKS" class="text-muted small ms-2">
        {{ MAX_LINKS }} liens au maximum.
      </span>
    </div>
  </div>
</template>
