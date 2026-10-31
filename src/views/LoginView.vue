<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as Yup from 'yup'
import type { SubmissionContext } from 'vee-validate'
import { getErrorMessage } from '@/helpers'
import { useAuthStore } from '@/stores'

const schema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
})

function onSubmit(values: Record<string, string>, { setErrors }: SubmissionContext) {
  const authStore = useAuthStore()
  const { username, password } = values

  return authStore
    .login(username, password)
    .catch((error) => setErrors({ apiError: getErrorMessage(error) }))
}
</script>

<template>
  <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
    <div class="mb-3">
      <label for="username" class="form-label">Email / Nom d'utilisateur</label>
      <Field
        name="username"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': errors.username }"
      />
      <!-- div class="invalid-feedback">{{ errors.username }}</div -->
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Mot de passe</label>
      <Field
        name="password"
        type="password"
        class="form-control"
        :class="{ 'is-invalid': errors.password }"
      />
      <!--div class="invalid-feedback">{{ errors.password }}</div-->
    </div>
    <div class="d-grid">
      <button
        type="submit"
        :class="{ 'btn btn-primary': true, disabled: isSubmitting }"
        :disabled="isSubmitting"
      >
        <div
          v-show="isSubmitting"
          class="spinner-border spinner-border-sm text-light"
          role="status"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
        <font-awesome-icon :icon="['far', 'user']" size="s" v-show="!isSubmitting" />

        Se connecter
      </button>
    </div>
  </Form>
</template>
