<script setup lang="ts">
import FormModal from '@/components/FormModal.vue'
import { useSubmit } from '@/composables/useSubmit'
import { fromDateInput, toDateInput } from '@/helpers/date'
import { useAnimesStore } from '@/stores'
import type { AnimeForm } from '@/types/forms/AnimeForm'
import type { SubmissionContext } from 'vee-validate'
import { ErrorMessage, Field } from 'vee-validate'
import { computed, useTemplateRef } from 'vue'
import * as yup from 'yup'

const props = defineProps({
  anime: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const modal = useTemplateRef<InstanceType<typeof FormModal>>('modal')
const store = useAnimesStore()
const { submitError, submit } = useSubmit()

const isEdit = computed(() => !!props.anime)

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
  const payload: AnimeForm = {
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
      await store.update(props.anime.id, payload)
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
    id="animeModal"
    title="d'un animé"
    add-other-label="Ajouter un autre animé"
    :is-edit="isEdit"
    :schema="schema"
    :initial-values="{
      name: props.anime?.name ?? '',
      japaneseName: props.anime?.japaneseName ?? '',
      romanizedJapaneseName: props.anime?.romanizedJapaneseName ?? '',
      synopsis: props.anime?.synopsis ?? '',
      usReleaseDate: toDateInput(props.anime?.usReleaseDate),
      japanReleaseDate: toDateInput(props.anime?.japanReleaseDate),
      europeReleaseDate: toDateInput(props.anime?.europeReleaseDate),
    }"
    :form-key="props.anime?.id ?? 'new'"
    :submit-error="submitError"
    @submit="onSubmit"
    @reset="submitError = null"
  >
    <div class="mb-3">
      <label class="form-label" for="animeModal-name">Nom</label>
      <Field name="name" id="animeModal-name" type="text" class="form-control" />
      <ErrorMessage name="name" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="animeModal-japaneseName">Nom japonais</label>
      <Field name="japaneseName" id="animeModal-japaneseName" type="text" class="form-control" />
      <ErrorMessage name="japaneseName" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="animeModal-romanizedJapaneseName">Nom japonais (rōmaji)</label>
      <Field
        name="romanizedJapaneseName"
        id="animeModal-romanizedJapaneseName"
        type="text"
        class="form-control"
      />
      <ErrorMessage name="romanizedJapaneseName" class="text-danger small" />
    </div>
    <div class="mb-3">
      <label class="form-label" for="animeModal-synopsis">Synopsis</label>
      <Field name="synopsis" id="animeModal-synopsis" as="textarea" rows="4" class="form-control" />
      <ErrorMessage name="synopsis" class="text-danger small" />
    </div>
    <div class="row">
      <div class="col-md-4 mb-3">
        <label class="form-label" for="animeModal-japanReleaseDate">Sortie au Japon</label>
        <Field
          name="japanReleaseDate"
          id="animeModal-japanReleaseDate"
          type="date"
          class="form-control"
        />
        <ErrorMessage name="japanReleaseDate" class="text-danger small" />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label" for="animeModal-usReleaseDate">Sortie aux États-Unis</label>
        <Field
          name="usReleaseDate"
          id="animeModal-usReleaseDate"
          type="date"
          class="form-control"
        />
        <ErrorMessage name="usReleaseDate" class="text-danger small" />
      </div>
      <div class="col-md-4 mb-3">
        <label class="form-label" for="animeModal-europeReleaseDate">Sortie en Europe</label>
        <Field
          name="europeReleaseDate"
          id="animeModal-europeReleaseDate"
          type="date"
          class="form-control"
        />
        <ErrorMessage name="europeReleaseDate" class="text-danger small" />
      </div>
    </div>
  </FormModal>
</template>
