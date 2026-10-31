<script setup lang="ts">
import { computed } from 'vue'
import type { RouterLinkProps } from 'vue-router'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<RouterLinkProps & { inactiveClass?: string }>()

const isExternalLink = computed(() => {
  return typeof props.to === 'string' && props.to.startsWith('http')
})
</script>

<template>
  <a v-if="isExternalLink" v-bind="$attrs" :href="to as string" target="_blank">
    <slot />
  </a>
  <router-link v-else v-bind="$props" custom v-slot="{ isActive, href, navigate }">
    <a
      v-bind="$attrs"
      :href="href"
      @click="navigate"
      :class="isActive ? activeClass : inactiveClass"
    >
      <slot></slot>
    </a>
  </router-link>
</template>
