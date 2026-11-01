import type { CardGroup } from './CardGroup'
import type { CardSubType } from './CardSubType'
import type { MonsterAttribute } from './MonsterAttribute'
import type { MonsterEffect } from './MonsterEffect'
import type { MonsterSubType } from './MonsterSubType'
import type { MonsterType } from './MonsterType'
import type { NamedRef } from './Ref'
import type { Tag } from './Tag'

export interface AbstractCard {
  '@id': string
  id: number
  name: string
  level?: number
  atk?: number
  def?: number
  bluePendulum?: number
  redPendulum?: number
  cardSubType: CardSubType
  cardGroup?: CardGroup
  monsterAttribute?: MonsterAttribute
  monsterSubType?: MonsterSubType
  monsterType?: MonsterType
  monsterEffects: MonsterEffect[]
  tags: Tag[]
  /** Rulings de la carte, lus avec leur nom */
  rulings?: NamedRef[]
}
