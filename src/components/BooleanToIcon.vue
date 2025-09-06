<script setup lang="ts">
const props = defineProps<{
  field: boolean
}>()
</script>

<template>
  <font-awesome-icon v-if="props.field" :icon="['fa', 'check']" />
  <font-awesome-icon v-else :icon="['fa', 'xmark']" />
</template>
