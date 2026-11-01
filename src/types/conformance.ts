/**
 * Vérifie à la compilation que les modèles écrits à la main restent compatibles
 * avec les types générés depuis l'API. Si un check échoue après `npm run gen`,
 * le schéma de l'API a changé : adapter le modèle correspondant.
 */
import type {
  ApiAbstractCard,
  ApiAnime,
  ApiArc,
  ApiArcSeason,
  ApiAstrologicalSign,
  ApiGender,
  ApiManga,
  ApiSeason,
  ApiActualityCategory,
  ApiCard,
  ApiCharacter,
  ApiCardGroup,
  ApiCardSubType,
  ApiCardType,
  ApiCountry,
  ApiExtension,
  ApiExtensionType,
  ApiMonsterAttribute,
  ApiMonsterEffect,
  ApiMonsterSubType,
  ApiMonsterType,
  ApiRarity,
  ApiTag,
  ApiVideoGameSupport,
} from './api-types'
import type { AbstractCard } from './models/AbstractCard'
import type { Anime } from './models/Anime'
import type { Arc } from './models/Arc'
import type { ArcSeason } from './models/ArcSeason'
import type { AstrologicalSign } from './models/AstrologicalSign'
import type { Gender } from './models/Gender'
import type { Manga } from './models/Manga'
import type { Season } from './models/Season'
import type { ActualityCategory } from './models/ActualityCategory'
import type { Card } from './models/Card'
import type { Character } from './models/Character'
import type { CardGroup } from './models/CardGroup'
import type { CardSubType } from './models/CardSubType'
import type { CardType } from './models/CardType'
import type { Country } from './models/Country'
import type { Extension } from './models/Extension'
import type { ExtensionType } from './models/ExtensionType'
import type { MonsterAttribute } from './models/MonsterAttribute'
import type { MonsterEffect } from './models/MonsterEffect'
import type { MonsterSubType } from './models/MonsterSubType'
import type { MonsterType } from './models/MonsterType'
import type { Rarity } from './models/Rarity'
import type { Tag } from './models/Tag'
import type { VideoGameSupport } from './models/VideoGameSupport'

// '@context' et '@type' (Hydra) sont toujours renvoyés mais inutilisés par l'admin
type StripHydra<T> = T extends (infer U)[]
  ? StripHydra<U>[]
  : T extends object
    ? { [K in keyof T as K extends '@context' | '@type' ? never : K]: StripHydra<T[K]> }
    : T

type Conforms<Model, Api> = [Model] extends [StripHydra<Api>] ? true : false
type Assert<T extends true> = T

export type ModelChecks = [
  Assert<Conforms<Card, ApiCard>>,
  Assert<Conforms<AbstractCard, ApiAbstractCard>>,
  Assert<Conforms<Character, ApiCharacter>>,
  Assert<Conforms<Anime, ApiAnime>>,
  Assert<Conforms<Arc, ApiArc>>,
  Assert<Conforms<ArcSeason, ApiArcSeason>>,
  Assert<Conforms<AstrologicalSign, ApiAstrologicalSign>>,
  Assert<Conforms<Gender, ApiGender>>,
  Assert<Conforms<Manga, ApiManga>>,
  Assert<Conforms<Season, ApiSeason>>,
  Assert<Conforms<ActualityCategory, ApiActualityCategory>>,
  Assert<Conforms<CardGroup, ApiCardGroup>>,
  Assert<Conforms<CardSubType, ApiCardSubType>>,
  Assert<Conforms<CardType, ApiCardType>>,
  Assert<Conforms<Country, ApiCountry>>,
  Assert<Conforms<Extension, ApiExtension>>,
  Assert<Conforms<ExtensionType, ApiExtensionType>>,
  Assert<Conforms<MonsterAttribute, ApiMonsterAttribute>>,
  Assert<Conforms<MonsterEffect, ApiMonsterEffect>>,
  Assert<Conforms<MonsterSubType, ApiMonsterSubType>>,
  Assert<Conforms<MonsterType, ApiMonsterType>>,
  Assert<Conforms<Rarity, ApiRarity>>,
  Assert<Conforms<Tag, ApiTag>>,
  Assert<Conforms<VideoGameSupport, ApiVideoGameSupport>>,
]
