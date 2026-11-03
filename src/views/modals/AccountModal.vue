<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { useAccountsStore, useAuthStore } from '@/stores'
import type { AccountForm } from '@/types/forms/AccountForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  account: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useAccountsStore()
const auth = useAuthStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.account)
// Un administrateur ne peut pas retirer son propre rôle (l'API refuse aussi)
const isSelf = computed(() => !!props.account && props.account.id === auth.user?.id)

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/

// Création : mot de passe obligatoire. Modification : vide = inchangé.
const schema = computed(() =>
  yup.object({
    username: yup
      .string()
      .required("Nom d'utilisateur requis")
      .min(3, '3 caractères minimum')
      .max(50, '50 caractères maximum'),
    email: yup.string().required('Email requis').email('Email invalide'),
    role: yup.string().oneOf(['ROLE_USER', 'ROLE_MEDIATOR', 'ROLE_ADMIN']).required(),
    plainPassword: isEdit.value
      ? yup
          .string()
          .nullable()
          .test(
            'password-rule',
            '8 à 128 caractères avec majuscule, minuscule, chiffre et caractère spécial',
            (value) => !value || PASSWORD_RULE.test(value),
          )
      : yup
          .string()
          .required('Mot de passe requis')
          .matches(
            PASSWORD_RULE,
            '8 à 128 caractères avec majuscule, minuscule, chiffre et caractère spécial',
          ),
  }),
)

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const payload: AccountForm = {
    username: String(values.username),
    email: String(values.email),
    roles: [String(values.role)],
    banned: Boolean(values.banned),
    emailVerified: Boolean(values.emailVerified),
  }
  // Absent = mot de passe inchangé
  if (values.plainPassword) payload.plainPassword = String(values.plainPassword)
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.account.id, payload)
    } else {
      await store.create(payload)
    }
  }, setErrors)
  if (!saved) return
  emit('saved')
  modal.value?.finish(isEdit.value)
}

defineExpose({ showModal: () => modal.value?.show() })
</script>

<template>
  <FormModal
    ref="modal"
    id="accountModal"
    title="d'un compte"
    add-other-label="Ajouter un autre compte"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      username: props.account?.username ?? '',
      email: props.account?.email ?? '',
      role: props.account?.roles?.includes('ROLE_ADMIN')
        ? 'ROLE_ADMIN'
        : props.account?.roles?.includes('ROLE_MEDIATOR')
          ? 'ROLE_MEDIATOR'
          : 'ROLE_USER',
      banned: props.account?.banned ?? false,
      emailVerified: props.account?.emailVerified ?? true,
      plainPassword: '',
    }"
    :form-key="props.account?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="accountModal-username">Nom d'utilisateur</label>
      <Field
        name="username"
        id="accountModal-username"
        type="text"
        class="form-control"
        autocomplete="off"
      />
      <ErrorMessage name="username" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="accountModal-email">Email</label>
      <Field
        name="email"
        id="accountModal-email"
        type="email"
        class="form-control"
        autocomplete="off"
      />
      <ErrorMessage name="email" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="accountModal-role">Rôle</label>
      <Field as="select" name="role" id="accountModal-role" class="form-select" :disabled="isSelf">
        <option value="ROLE_USER">Utilisateur</option>
        <option value="ROLE_MEDIATOR">Médiateur</option>
        <option value="ROLE_ADMIN">Administrateur</option>
      </Field>
      <div v-if="isSelf" class="form-text">Tu ne peux pas modifier ton propre rôle.</div>
      <ErrorMessage name="role" class="text-danger small" />
    </div>
    <div class="form-check mb-3">
      <Field
        name="banned"
        id="accountModal-banned"
        type="checkbox"
        class="form-check-input"
        :value="true"
        :unchecked-value="false"
        :disabled="isSelf"
      />
      <label class="form-check-label" for="accountModal-banned">Banni</label>
      <div class="form-text">
        Un compte banni ne peut plus se connecter. Ses commentaires restent en place (à masquer
        depuis la modération).
      </div>
      <ErrorMessage name="banned" class="text-danger small" />
    </div>
    <div class="form-check mb-3">
      <Field
        name="emailVerified"
        id="accountModal-emailVerified"
        type="checkbox"
        class="form-check-input"
        :value="true"
        :unchecked-value="false"
      />
      <label class="form-check-label" for="accountModal-emailVerified">
        Adresse e-mail confirmée
      </label>
      <div class="form-text">
        Un compte dont l'adresse n'est pas confirmée ne peut pas se connecter. Cocher pour le
        confirmer à la main.
      </div>
      <ErrorMessage name="emailVerified" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="accountModal-password">
        {{ isEdit ? 'Nouveau mot de passe' : 'Mot de passe' }}
      </label>
      <Field
        name="plainPassword"
        id="accountModal-password"
        type="password"
        class="form-control"
        autocomplete="new-password"
      />
      <div class="form-text">
        {{
          isEdit
            ? 'Laisser vide pour ne pas le changer ; s’il change, le joueur est déconnecté et doit se reconnecter. '
            : ''
        }}8 à 128 caractères avec majuscule, minuscule, chiffre et caractère spécial.
      </div>
      <ErrorMessage name="plainPassword" class="text-danger small" />
    </div>
  </FormModal>
</template>
