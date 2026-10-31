<script setup lang="ts">
import type { AbstractCard } from '@/types/models/AbstractCard'

const props = defineProps<{
  abstractCard: AbstractCard
}>()
const cardSubTypeName = props.abstractCard.cardSubType.name.toLowerCase()

function isXyz(): boolean {
  return cardSubTypeName.indexOf('xyz') != -1
}

function isLink(): boolean {
  return cardSubTypeName.indexOf('lien') != -1
}

function isPendulum(): boolean {
  return props.abstractCard.monsterSubType?.name.toLowerCase() === 'pendulum'
}

function getLevelRankLinkLabel(): string {
  if (isXyz()) {
    return 'Rang'
  }

  if (isLink()) {
    return 'Lien'
  }

  return 'Niveau'
}

function displaySpecial(property: number): number | string {
  if (property === -1) {
    return '?'
  }

  if (property === -2) {
    return 'X000'
  }

  return property
}
</script>

<template>
  <dl v-if="props.abstractCard.monsterAttribute" class="row">
    <dt class="col-sm-3">{{ getLevelRankLinkLabel() }}</dt>
    <dd class="col-sm-9">{{ abstractCard.level }}</dd>

    <dt class="col-sm-3">ATK</dt>
    <dd class="col-sm-9">{{ displaySpecial(abstractCard.atk as number) }}</dd>

    <dt class="col-sm-3">DEF</dt>
    <dd class="col-sm-9">{{ displaySpecial(abstractCard.def as number) }}</dd>

    <template v-if="isPendulum()">
      <dt class="col-sm-3">Echelle pendule bleue</dt>
      <dd class="col-sm-9">{{ abstractCard.bluePendulum }}</dd>

      <dt class="col-sm-3">Echelle pendule rouge</dt>
      <dd class="col-sm-9">{{ abstractCard.redPendulum }}</dd>
    </template>
  </dl>
  <template v-else>-</template>
</template>
