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
