<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores'

const { user } = storeToRefs(useAuthStore())
</script>

<template>
  <div>
    <h1>Bonjour {{ user?.username }} !</h1>
    <p>Bienvenue dans l'administration de Yu-Gi-Oh! Destiny Reborn.</p>
  </div>
</template>
