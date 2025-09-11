<script setup lang="ts">
import { useMediaObjectsStore } from '@/stores/media_object.store'
import { icon } from '@fortawesome/fontawesome-svg-core'
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string | null
  uploading: boolean
  context: string
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'update:uploading', value: boolean): void
}>()

const mediaObjectsStore = useMediaObjectsStore()
const isUploading = ref(false)
const isUploaded = ref(false)

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isUploading.value = true
  emit('update:uploading', true)
  try {
    const media = await mediaObjectsStore.uploadFile(file, props.context)
    isUploaded.value = true
    emit('update:modelValue', media)
  } catch (err) {
    console.error('Erreur upload', err)
    emit('update:modelValue', null)
  } finally {
    isUploading.value = false
    emit('update:uploading', false)
  }
}

function clearFile() {
  isUploaded.value = false
  emit('update:uploading', false)
  emit('update:modelValue', null)
}

defineExpose({ clearFile })
</script>

<template>
  <div class="mb-3">
    <label class="form-label">{{ label ?? 'Fichier' }}</label>
    <div class="input-group">
      <input type="file" class="form-control" accept="image/*" @change="handleFileChange" />
      <a @click="clearFile()" class="input-group-text text-muted" role="button">
        <font-awesome-icon v-if="isUploaded" :icon="['fa', 'xmark']" />
      </a>

      <span v-if="isUploading" class="input-group-text text-muted">
        <font-awesome-icon :icon="['fas', 'spinner']" spin />
      </span>
    </div>
  </div>
</template>
