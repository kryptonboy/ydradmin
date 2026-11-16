import type { AbstractCard } from '@/types/models/AbstractCard'

export function getFullyQualifiedCssClass(abstractCard: AbstractCard): string {
  let className: string = abstractCard.cardSubType.cssClass

  if (
    abstractCard.monsterAttribute &&
    abstractCard.monsterSubType?.name.toLowerCase() === 'pendulum'
  )
    className = 'pendulum-' + className

  return className
}

/** Libellé d'une impression embarquée : « nom (référence) », ou son IRI si l'API n'envoie que la relation */
export function cardPriceLabel(card: { '@id': string; name?: string; reference?: string }): string {
  if (!card.name) return card.reference ?? card['@id']
  return card.reference ? `${card.name} (${card.reference})` : card.name
}
