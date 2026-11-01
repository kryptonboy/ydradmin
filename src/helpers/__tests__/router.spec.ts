import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { router } from '../router'

beforeEach(() => {
  setActivePinia(createPinia())
})

function matchedPath(path: string): string | undefined {
  return router.resolve(path).matched[0]?.path
}

describe('routes avec identifiant numérique', () => {
  it("reconnaît l'édition d'une actualité par son identifiant", () => {
    expect(matchedPath('/content/actuality/12')).toBe('/content/actuality/:id(\\d+)')
  })

  it("ne confond pas la création avec l'édition", () => {
    expect(matchedPath('/content/actuality/new')).toBe('/content/actuality/new')
  })

  it("reconnaît la structure d'un animé", () => {
    expect(matchedPath('/anime_manga/anime/3')).toBe('/anime_manga/anime/:id(\\d+)')
  })

  it('reconnaît les pages de modification des épisodes et des chapitres', () => {
    expect(matchedPath('/anime_manga/episode/7')).toBe('/anime_manga/episode/:id(\\d+)')
    expect(matchedPath('/anime_manga/chapter/7')).toBe('/anime_manga/chapter/:id(\\d+)')
    expect(matchedPath('/anime_manga/episode/new')).toBe('/anime_manga/episode/new')
    expect(matchedPath('/anime_manga/chapter/new')).toBe('/anime_manga/chapter/new')
  })

  it('reconnaît les pages des jeux vidéo', () => {
    expect(matchedPath('/video_game/game/8')).toBe('/video_game/game/:id(\\d+)')
    expect(matchedPath('/video_game/game/new')).toBe('/video_game/game/new')
    expect(matchedPath('/video_game/support')).toBe('/video_game/support')
    expect(matchedPath('/video_game/game/abc')).toBe('/:pathMatch(.*)*')
  })

  it('reconnaît les pages des films', () => {
    expect(matchedPath('/anime_manga/movie/6')).toBe('/anime_manga/movie/:id(\\d+)')
    expect(matchedPath('/anime_manga/movie/new')).toBe('/anime_manga/movie/new')
    expect(matchedPath('/anime_manga/movie/abc')).toBe('/:pathMatch(.*)*')
  })

  it("reconnaît la page des personnages d'un manga", () => {
    expect(matchedPath('/anime_manga/manga/2')).toBe('/anime_manga/manga/:id(\\d+)')
    expect(matchedPath('/anime_manga/manga/abc')).toBe('/:pathMatch(.*)*')
  })

  it("reconnaît la fiche d'un personnage", () => {
    expect(matchedPath('/anime_manga/character/4')).toBe('/anime_manga/character/:id(\\d+)')
    expect(matchedPath('/anime_manga/character')).toBe('/anime_manga/character')
  })

  it('reconnaît les pages de modération et des smileys', () => {
    expect(matchedPath('/content/actuality_comment')).toBe('/content/actuality_comment')
    expect(matchedPath('/content/smiley')).toBe('/content/smiley')
    expect(matchedPath('/users')).toBe('/users')
  })

  it('refuse un identifiant non numérique', () => {
    expect(matchedPath('/anime_manga/anime/abc')).toBe('/:pathMatch(.*)*')
    expect(matchedPath('/content/actuality/abc')).toBe('/:pathMatch(.*)*')
  })
})
