<script setup lang="ts">
import { getErrorMessage } from '@/helpers/api-error'
import { mediaUrl } from '@/helpers/media'
import { useMediaObjectsStore } from '@/stores/media_object.store'
import type { MediaMap } from '@/types/content-blocks'
import { computed, inject, reactive, ref } from 'vue'
import { mediaMapKey } from './injection'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    /** Contexte du MediaObject côté API (ex. `content_bloc_image`) */
    context: string
    label: string
    id: string
    accept?: string
    invalid?: boolean
  }>(),
  { accept: 'image/*', invalid: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const store = useMediaObjectsStore()
const mediaMap = inject(mediaMapKey, reactive<MediaMap>({}))
const uploading = ref(false)
const error = ref<string | null>(null)

const media = computed(() => (props.modelValue ? mediaMap[props.modelValue] : undefined))
const url = computed(() => mediaUrl(media.value?.contentUrl))
const isImage = computed(() => props.accept.startsWith('image'))

async function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  error.value = null
  try {
    const uploaded = await store.upload(file, props.context)
    mediaMap[uploaded.id] = uploaded
    emit('update:modelValue', uploaded.id)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <div>
    <label class="form-label" :for="id">{{ label }}</label>
    <div class="d-flex align-items-center gap-2">
      <img
        v-if="isImage && url"
        :src="url"
        alt=""
        class="img-thumbnail"
        style="max-height: 4rem; max-width: 6rem; object-fit: cover"
      />
      <a v-else-if="url" :href="url" target="_blank" rel="noopener">Fichier #{{ modelValue }}</a>
      <span v-else-if="modelValue" class="text-muted small">Média #{{ modelValue }}</span>
      <input
        :id="id"
        type="file"
        class="form-control"
        :class="{ 'is-invalid': invalid }"
        :accept="accept"
        :disabled="uploading"
        @change="onChange"
      />
      <font-awesome-icon v-if="uploading" :icon="['fas', 'spinner']" spin />
      <button
        v-if="modelValue"
        type="button"
        class="btn btn-outline-secondary btn-sm"
        aria-label="Retirer le fichier"
        title="Retirer le fichier"
        @click="emit('update:modelValue', null)"
      >
        <font-awesome-icon :icon="['fa', 'xmark']" />
      </button>
    </div>
    <div v-if="error" class="text-danger small mt-1" role="alert">{{ error }}</div>
  </div>
</template>
