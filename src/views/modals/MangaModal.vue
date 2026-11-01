<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { fromDateInput, toDateInput } from '@/helpers/date'
import { useMangasStore } from '@/stores'
import type { MangaForm } from '@/types/forms/MangaForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  manga: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useMangasStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.manga)

const schema = yup.object({
  name: yup.string().required('Nom requis'),
  japaneseName: yup.string().nullable(),
  romanizedJapaneseName: yup.string().nullable(),
  synopsis: yup.string().nullable(),
  usReleaseDate: yup.string().nullable(),
  japanReleaseDate: yup.string().nullable(),
  europeReleaseDate: yup.string().nullable(),
})

const onSubmit = async (values: Record<string, unknown>, { setErrors }: SubmissionContext) => {
  const form = values as Record<string, string | null>
  const payload: MangaForm = {
    name: form.name as string,
    japaneseName: form.japaneseName || null,
    romanizedJapaneseName: form.romanizedJapaneseName || null,
    synopsis: form.synopsis || null,
    usReleaseDate: fromDateInput(form.usReleaseDate),
    japanReleaseDate: fromDateInput(form.japanReleaseDate),
    europeReleaseDate: fromDateInput(form.europeReleaseDate),
  }
  const saved = await submit(async () => {
    if (isEdit.value) {
      await store.update(props.manga.id, payload)
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
    id="mangaModal"
    title="d'un manga"
    add-other-label="Ajouter un autre manga"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.manga?.name ?? '',
      japaneseName: props.manga?.japaneseName ?? '',
      romanizedJapaneseName: props.manga?.romanizedJapaneseName ?? '',
      synopsis: props.manga?.synopsis ?? '',
      usReleaseDate: toDateInput(props.manga?.usReleaseDate),
      japanReleaseDate: toDateInput(props.manga?.japanReleaseDate),
      europeReleaseDate: toDateInput(props.manga?.europeReleaseDate),
    }"
    :form-key="props.manga?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="mangaModal-name">Nom</label>
      <Field name="name" id="mangaModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="mangaModal-japaneseName">Nom japonais</label>
      <Field name="japaneseName" id="mangaModal-japaneseName" type="text" class="form-control" />
      <ErrorMessage name="japaneseName" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="mangaModal-romanizedJapaneseName">Nom japonais (rōmaji)</label>
      <Field
        name="romanizedJapaneseName"
        id="mangaModal-romanizedJapaneseName"
        type="text"
        class="form-control"
      />
      <ErrorMessage name="romanizedJapaneseName" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="mangaModal-synopsis">Synopsis</label>
      <Field name="synopsis" id="mangaModal-synopsis" as="textarea" rows="4" class="form-control" />
      <ErrorMessage name="synopsis" class="text-danger small" />
    </div>
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label" for="mangaModal-japanReleaseDate">Sortie au Japon</label>
        <Field
          name="japanReleaseDate"
          id="mangaModal-japanReleaseDate"
          type="date"
          class="form-control"
        />
        <ErrorMessage name="japanReleaseDate" class="text-danger small" />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label" for="mangaModal-usReleaseDate">Sortie aux États-Unis</label>
        <Field
          name="usReleaseDate"
          id="mangaModal-usReleaseDate"
          type="date"
          class="form-control"
        />
        <ErrorMessage name="usReleaseDate" class="text-danger small" />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label" for="mangaModal-europeReleaseDate">Sortie en Europe</label>
        <Field
          name="europeReleaseDate"
          id="mangaModal-europeReleaseDate"
          type="date"
          class="form-control"
        />
        <ErrorMessage name="europeReleaseDate" class="text-danger small" />
      </div>
    </div>
  </FormModal>
</template>
