<script setup lang="ts">
import { IMAGE_ALT_MAX } from '@/helpers/seo'
import { useField } from 'vee-validate'

/**
 * Texte alternatif d'une image principale (couverture, photo, bannière...).
 * Se branche sur le formulaire vee-validate parent (FormModal ou useForm), champ `name`.
 */
const props = defineProps<{
  /** Nom du champ dans le formulaire et dans l'API (ex. `imageAlt`) */
  name: string
  /** Identifiant DOM du champ */
  id: string
  /** Une image est présente (actuelle ou choisie) : l'absence d'alt est alors signalée */
  hasImage: boolean
}>()

const { value, errorMessage, handleChange, handleBlur } = useField<string | null>(() => props.name)
</script>

<template>
  <div class="mt-2">
    <label class="form-label" :for="props.id">Texte alternatif</label>
    <input
      :id="props.id"
      :name="props.name"
      type="text"
      class="form-control"
      :class="{ 'is-invalid': errorMessage }"
      :maxlength="IMAGE_ALT_MAX"
      :value="value ?? ''"
      @input="handleChange(($event.target as HTMLInputElement).value)"
      @blur="handleBlur"
    />
    <div v-if="errorMessage" class="invalid-feedback">{{ errorMessage }}</div>
    <div
      v-else-if="props.hasImage && !value?.trim()"
      class="form-text text-warning-emphasis"
      data-test="alt-missing"
    >
      Sans texte alternatif, l'image est traitée comme décorative. Décrivez-la si elle porte une
      information.
    </div>
    <div v-else class="form-text">Décrit l'image pour les lecteurs d'écran.</div>
  </div>
</template>
