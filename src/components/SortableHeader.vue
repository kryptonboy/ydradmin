<script setup lang="ts">
import { computed } from 'vue'
import type { Sort } from '@/types/Api'

const props = defineProps<{
  /** Champ de tri API correspondant à la colonne */
  field: string
  sort: Sort
}>()

defineEmits<{ sort: [field: string] }>()

const isSorted = computed(() => props.sort.sortBy === props.field)
const ariaSort = computed(() => {
  if (!isSorted.value) return 'none'
  return props.sort.sortDir === 'asc' ? 'ascending' : 'descending'
})
const icon = computed(() => {
  if (!isSorted.value) return ['fa', 'sort']
  return props.sort.sortDir === 'asc' ? ['fa', 'sort-up'] : ['fa', 'sort-down']
})
</script>

<template>
  <th
    scope="col"
    role="button"
    tabindex="0"
    :aria-sort="ariaSort"
    @click="$emit('sort', field)"
    @keydown.enter="$emit('sort', field)"
  >
    <slot />
    <font-awesome-icon :icon="icon" />
  </th>
</template>
