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

  it('refuse un identifiant non numérique', () => {
    expect(matchedPath('/anime_manga/anime/abc')).toBe('/:pathMatch(.*)*')
    expect(matchedPath('/content/actuality/abc')).toBe('/:pathMatch(.*)*')
  })
})
