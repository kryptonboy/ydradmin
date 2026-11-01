/**
 * Alias lisibles des types générés depuis le schéma OpenAPI de l'API (`npm run gen`).
 * `openapi.d.ts` est généré : ne pas le modifier à la main.
 */
import type { components } from './openapi'

type Schemas = components['schemas']

// Payloads d'écriture (POST) : les relations sont des IRI
export type CardInput = Schemas['Card-card.write']
export type CardGroupInput = Schemas['CardGroup-card_group.write']
export type CardSubTypeInput = Schemas['CardSubType-card_sub_type.write']
export type CardTypeInput = Schemas['CardType-card_type.write']
export type CountryInput = Schemas['Country-country.write']
export type ExtensionInput = Schemas['Extension-extension.write']
export type ExtensionTypeInput = Schemas['ExtensionType-extension_type.write']
export type MonsterAttributeInput = Schemas['MonsterAttribute-monster_attribute.write']
export type MonsterEffectInput = Schemas['MonsterEffect-monster_effect.write']
export type MonsterSubTypeInput = Schemas['MonsterSubType-monster_sub_type.write']
export type MonsterTypeInput = Schemas['MonsterType-monster_type.write']
export type RarityInput = Schemas['Rarity-rarity.write']
export type TagInput = Schemas['Tag-tag.write']
export type AbstractCardInput = Schemas['AbstractCard.AbstractCardInput']

// Réponses de lecture (JSON-LD) dans le contexte propre à chaque ressource
export type ApiCard = Schemas['Card.jsonld-card.read_entity.read']
export type ApiAbstractCard = Schemas['AbstractCard.jsonld-abstract_card.read_entity.read']
export type ApiCardGroup = Schemas['CardGroup.jsonld-card_group.read_entity.read']
export type ApiCardSubType = Schemas['CardSubType.jsonld-card_sub_type.read_entity.read']
export type ApiCardType = Schemas['CardType.jsonld-card_type.read_entity.read']
export type ApiCountry = Schemas['Country.jsonld-country.read_entity.read']
export type ApiExtension = Schemas['Extension.jsonld-extension.read_entity.read']
export type ApiExtensionType = Schemas['ExtensionType.jsonld-extension_type.read_entity.read']
export type ApiMonsterAttribute =
  Schemas['MonsterAttribute.jsonld-monster_attribute.read_entity.read']
export type ApiMonsterEffect = Schemas['MonsterEffect.jsonld-monster_effect.read_entity.read']
export type ApiMonsterSubType = Schemas['MonsterSubType.jsonld-monster_sub_type.read_entity.read']
export type ApiMonsterType = Schemas['MonsterType.jsonld-monster_type.read_entity.read']
export type ApiRarity = Schemas['Rarity.jsonld-rarity.read_entity.read']
export type ApiTag = Schemas['Tag.jsonld-tag.read_entity.read']
export type ApiMediaObject = Schemas['MediaObject.jsonld-media_object.read_entity.read']

export type ActualityInput = Schemas['Actuality-actuality.write']
export type ActualityCategoryInput = Schemas['ActualityCategory-actuality_category.write']
export type ApiActualityCategory =
  Schemas['ActualityCategory.jsonld-actuality_category.read_entity.read']

export type GenderInput = Schemas['Gender-gender.write']
export type AstrologicalSignInput = Schemas['AstrologicalSign-astrological_sign.write']
export type AnimeInput = Schemas['Anime-anime.write']
export type MangaInput = Schemas['Manga-manga.write']
export type SeasonInput = Schemas['Season-season.write']
export type ArcInput = Schemas['Arc-arc.write']
export type ArcSeasonInput = Schemas['ArcSeason-arc_season.write']

export type ApiGender = Schemas['Gender.jsonld-gender.read_entity.read']
export type ApiAstrologicalSign =
  Schemas['AstrologicalSign.jsonld-astrological_sign.read_entity.read']
export type ApiAnime = Schemas['Anime.jsonld-anime.read_entity.read']
export type ApiManga = Schemas['Manga.jsonld-manga.read_entity.read']
export type ApiSeason = Schemas['Season.jsonld-season.read_entity.read']
export type ApiArc = Schemas['Arc.jsonld-arc.read_entity.read']
export type ApiArcSeason = Schemas['ArcSeason.jsonld-arc_season.read_entity.read']

export type CharacterInput = Schemas['Character-character.write']
export type ApiCharacter = Schemas['Character.jsonld-character.read_entity.read']
