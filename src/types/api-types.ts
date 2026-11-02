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
export type GradingCompanyInput = Schemas['GradingCompany-grading_company.write']
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
export type ApiGradingCompany = Schemas['GradingCompany.jsonld-grading_company.read_entity.read']
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

export type ApiGender = Schemas['Gender.jsonld-gender.read_entity.read_label']
export type ApiAstrologicalSign =
  Schemas['AstrologicalSign.jsonld-astrological_sign.read_entity.read_label']
export type ApiAnime = Schemas['Anime.jsonld-anime.read_entity.read_label']
export type ApiManga = Schemas['Manga.jsonld-manga.read_entity.read_label']
export type ApiSeason = Schemas['Season.jsonld-season.read_entity.read_label']
export type ApiArc = Schemas['Arc.jsonld-arc.read_entity.read_label']
export type ApiArcSeason = Schemas['ArcSeason.jsonld-arc_season.read_entity.read_label']

export type CharacterInput = Schemas['Character-character.write']
export type ApiCharacter = Schemas['Character.jsonld-character.read_entity.read_label']

export type EpisodeInput = Schemas['Episode-episode.write']
export type ChapterInput = Schemas['Chapter-chapter.write']
export type EpisodeCharacterInput = Schemas['EpisodeCharacter-episode_character.write']
export type ChapterCharacterInput = Schemas['ChapterCharacter-chapter_character.write']

export type ApiCardUsage = Schemas['CardUsage']
export type ApiCardUsageList = Schemas['CardUsageList']

export type VideoGameSupportInput = Schemas['VideoGameSupport-video_game_support.write']
export type VideoGameInput = Schemas['VideoGame-video_game.write']
export type VideoGameCharacterInput = Schemas['VideoGameCharacter-video_game_character.write']
export type ApiVideoGameSupport =
  Schemas['VideoGameSupport.jsonld-video_game_support.read_entity.read_label']

export type GameFormatInput = Schemas['GameFormat-game_format.write']
export type RestrictionInput = Schemas['Restriction-restriction.write']
export type ApiGameFormat = Schemas['GameFormat.jsonld-game_format.read_entity.read_label']
export type ApiRestriction = Schemas['Restriction.jsonld-restriction.read_entity.read_label']

export type MovieInput = Schemas['Movie-movie.write']
export type MovieCharacterInput = Schemas['MovieCharacter-movie_character.write']

export type MangaCharacterInput = Schemas['MangaCharacter-manga_character.write']
export type ArcCharacterInput = Schemas['ArcCharacter-arc_character.write']
export type ApiMangaCharacter =
  Schemas['MangaCharacter.jsonld-manga_character.read_entity.read_label']
export type ApiArcCharacter = Schemas['ArcCharacter.jsonld-arc_character.read_entity.read_label']

export type RulingInput = Schemas['Ruling-ruling.write']
export type ApiRuling = Schemas['Ruling.jsonld-ruling.read_entity.read_label']

// Détail (avec `blocks` et `media`) : réponses de GET /{id}, POST et PATCH
export type ApiAnimeDetail = Schemas['Anime.jsonld-anime.read_anime.detail_entity.read_label']
export type ApiMangaDetail = Schemas['Manga.jsonld-manga.read_manga.detail_entity.read_label']
export type ApiCharacterDetail =
  Schemas['Character.jsonld-character.read_character.detail_entity.read_label']

export type SmileyInput = Schemas['Smiley-smiley.write']
export type ApiSmiley = Schemas['Smiley.jsonld-smiley.read_entity.read']
// Pas de création de commentaire côté API : seules content et hidden sont modifiables (PATCH)
export type ActualityCommentInput =
  Schemas['ActualityComment-actuality_comment.write.jsonMergePatch']
export type ApiActualityComment =
  Schemas['ActualityComment.jsonld-actuality_comment.read_entity.read']

// Comptes utilisateurs (administrateurs uniquement). Le mot de passe n'existe qu'en écriture.
export type AccountInput = Schemas['User-user.write.jsonMergePatch']
export type ApiAccount = Schemas['User.jsonld-user.read']

export type DeckInput = Schemas['Deck-deck.write.jsonMergePatch']
export type ApiDeck = Schemas['Deck.jsonld-deck.read_entity.read']
