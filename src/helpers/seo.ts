import * as yup from 'yup'

/** Longueur maximale acceptée par l'API pour `metaDescription` */
export const META_DESCRIPTION_MAX = 320

/** Règle yup du résumé pour les moteurs : facultatif, 320 caractères au plus */
export const metaDescriptionRule = () =>
  yup.string().nullable().max(META_DESCRIPTION_MAX, `${META_DESCRIPTION_MAX} caractères maximum`)

/**
 * Valeur envoyée à l'API : texte sans espaces de bord, ou null s'il est vide.
 * Null efface le résumé : la clé disparaît alors des réponses et le front prend son texte de repli.
 */
export function toMetaDescription(value: unknown): string | null {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || null
}
