<script setup lang="ts">
import { META_DESCRIPTION_MAX } from '@/helpers/seo'
import { useField } from 'vee-validate'
import { computed } from 'vue'

/**
 * Champ `metaDescription` (résumé pour les moteurs de recherche et les moteurs génératifs).
 * Se branche sur le formulaire vee-validate parent (FormModal ou useForm).
 */
const props = defineProps<{
  /** Identifiant DOM du champ */
  id: string
  /** Texte repris par le front quand le résumé est vide (ex. « la description ») */
  fallback: string
}>()

const { value, errorMessage, handleChange, handleBlur } = useField<string | null>('metaDescription')

const length = computed(() => (value.value ?? '').length)
</script>

<template>
  <div class="mb-3">
    <label class="form-label" :for="props.id">Description pour les moteurs</label>
    <textarea
      :id="props.id"
      name="metaDescription"
      rows="3"
      class="form-control"
      :class="{ 'is-invalid': errorMessage }"
      :maxlength="META_DESCRIPTION_MAX"
      :value="value ?? ''"
      @input="handleChange(($event.target as HTMLTextAreaElement).value)"
      @blur="handleBlur"
    ></textarea>
    <div class="d-flex justify-content-between">
      <div class="form-text">
        Résumé affiché par les moteurs de recherche. Vide : le site reprend {{ props.fallback }}.
      </div>
      <div
        class="form-text text-nowrap ms-2"
        :class="{ 'text-danger': length > META_DESCRIPTION_MAX }"
        data-test="meta-count"
      >
        {{ length }} / {{ META_DESCRIPTION_MAX }}
      </div>
    </div>
    <div v-if="errorMessage" class="text-danger small">{{ errorMessage }}</div>
  </div>
</template>
