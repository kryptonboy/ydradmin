<script setup lang="ts">
import { mediaUrl } from '@/helpers/media'
import type { MediaLink } from '@/types/models/Ref'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    media?: MediaLink | null
    alt: string
    /** Hauteur maximale de l'aperçu (valeur CSS) */
    height?: string
  }>(),
  { media: null, height: '4rem' },
)

const url = computed(() => mediaUrl(props.media?.contentUrl))
</script>

<template>
  <img
    v-if="url"
    :src="url"
    :alt="alt"
    class="img-thumbnail mb-2 d-block"
    :style="{ maxHeight: height }"
  />
</template>
