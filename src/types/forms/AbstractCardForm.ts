export interface AbstractCardForm {
  name: string
  level?: number
  atk?: number
  def?: number
  bluePendulum?: number
  redPendulum?: number
  cardSubType: string
  cardGroup?: string
  monsterAttribute?: string
  monsterSubType?: string
  monsterType?: string
  monsterEffects: string[]
  tags: string[]
}
