import * as yup from 'yup'

/** Longueur maximale acceptée par l'API pour `metaDescription` */
export const META_DESCRIPTION_MAX = 320

/** Longueur maximale du texte alternatif d'une image principale (couverture, photo...) */
export const IMAGE_ALT_MAX = 255

/** Règle yup du résumé pour les moteurs : facultatif, 320 caractères au plus */
export const metaDescriptionRule = () =>
  yup.string().nullable().max(META_DESCRIPTION_MAX, `${META_DESCRIPTION_MAX} caractères maximum`)

/** Règle yup d'un texte alternatif d'image : facultatif, 255 caractères au plus */
export const imageAltRule = () =>
  yup.string().nullable().max(IMAGE_ALT_MAX, `${IMAGE_ALT_MAX} caractères maximum`)

/**
 * Texte facultatif envoyé à l'API : sans espaces de bord, ou null s'il est vide.
 * Null efface la valeur : la clé disparaît alors des réponses.
 */
export function toNullableText(value: unknown): string | null {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || null
}

/** Résumé pour les moteurs ; vide, le front prend son texte de repli */
export const toMetaDescription = toNullableText
