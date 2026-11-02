<script setup lang="ts">
import { createFetchWrapper } from '@/helpers'
import { getErrorMessage } from '@/helpers/api-error'
import { useAuthStore } from '@/stores'
import type { Account } from '@/types/models/Account'
import { onMounted, ref, useTemplateRef } from 'vue'

const props = defineProps<{ account: Account | null }>()

interface ImpersonationResult {
  token: string
  expiresIn: number
  user: { id: number; username: string }
}

const modalEl = useTemplateRef<HTMLElement>('modalEl')
let modalInstance: bootstrap.Modal | null = null

const result = ref<ImpersonationResult | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)
const copied = ref(false)

onMounted(() => {
  if (modalEl.value) modalInstance = new bootstrap.Modal(modalEl.value)
})

/** Le jeton ne vit que dans cette modale : il est effacé à la fermeture */
function reset() {
  result.value = null
  error.value = null
  copied.value = false
}

function show() {
  reset()
  modalInstance?.show()
}

function hide() {
  modalInstance?.hide()
  reset()
}

async function impersonate() {
  if (!props.account) return
  loading.value = true
  error.value = null
  try {
    result.value = await createFetchWrapper(useAuthStore()).post<ImpersonationResult>(
      `${import.meta.env.VITE_API_URL}/users/${props.account.id}/impersonate`,
    )
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function copy() {
  if (!result.value) return
  try {
    await navigator.clipboard.writeText(result.value.token)
    copied.value = true
  } catch {
    error.value = 'Copie impossible : sélectionne le jeton et copie-le à la main.'
  }
}

defineExpose({ showModal: show })
</script>

<template>
  <div id="impersonationModal" class="modal fade" tabindex="-1" aria-hidden="true" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Se connecter en tant que « {{ props.account?.username }} »</h5>
          <button type="button" class="btn-close" aria-label="Fermer" @click="hide"></button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
          <template v-if="!result">
            <p>
              Génère un jeton de connexion de ce joueur, valable 15 minutes, pour tester le site
              public sous son identité. L'administration reste connectée sous ton compte.
            </p>
            <p class="text-muted small mb-0">
              Le jeton donne accès au compte : ne le partage pas. Impossible pour un administrateur,
              un compte banni ou toi-même.
            </p>
          </template>
          <template v-else>
            <p>
              Jeton de <strong>{{ result.user.username }}</strong
              >, valable {{ Math.round(result.expiresIn / 60) }} minutes, sans renouvellement.
            </p>
            <textarea
              class="form-control font-monospace"
              rows="5"
              readonly
              aria-label="Jeton"
              :value="result.token"
            ></textarea>
            <div v-if="copied" class="text-success small mt-2" role="status">Jeton copié.</div>
          </template>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="hide">Fermer</button>
          <button
            v-if="!result"
            type="button"
            class="btn btn-primary"
            :disabled="loading"
            @click="impersonate"
          >
            <font-awesome-icon
              :icon="loading ? ['fas', 'spinner'] : ['fa', 'key']"
              :spin="loading"
            />
            Générer le jeton
          </button>
          <button v-else type="button" class="btn btn-primary" @click="copy">
            <font-awesome-icon :icon="['fa', 'copy']" />
            Copier le jeton
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
