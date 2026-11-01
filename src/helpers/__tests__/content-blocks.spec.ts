import { describe, expect, it } from 'vitest'
import type { Block, BlockType, EditorBlock } from '@/types/content-blocks'
import { BLOCK_LABELS } from '@/types/content-blocks'
import {
  countBlocks,
  createBlock,
  errorsUnder,
  moveItem,
  toApiBlocks,
  toEditorBlocks,
} from '../content-blocks'

describe('createBlock', () => {
  it.each(Object.keys(BLOCK_LABELS) as BlockType[])('crée un bloc « %s » avec un uid', (type) => {
    const block = createBlock(type)
    expect(block.type).toBe(type)
    expect(block.uid).toBeTruthy()
  })

  it('génère des uid distincts', () => {
    expect(createBlock('video').uid).not.toBe(createBlock('video').uid)
  })
})

describe('toApiBlocks', () => {
  it('retire les uid et les champs vides, récursivement', () => {
    const section = createBlock('section')
    if (section.type !== 'section') throw new Error('type inattendu')
    const video = createBlock('video')
    if (video.type !== 'video') throw new Error('type inattendu')
    video.url = 'https://example.com/v'
    section.title = ''
    section.children = [video]

    expect(toApiBlocks([section])).toEqual([
      {
        type: 'section',
        spoiler: false,
        children: [{ type: 'video', url: 'https://example.com/v' }],
      },
    ])
  })

  it('nettoie les images du carrousel, les entrées du glossaire et les onglets', () => {
    const carousel = createBlock('carousel')
    if (carousel.type !== 'carousel') throw new Error('type inattendu')
    carousel.images = [{ image: 12, title: '', description: 'Légende' }]
    const glossary = createBlock('glossary')
    if (glossary.type !== 'glossary') throw new Error('type inattendu')
    glossary.title = ''
    glossary.entries = [{ term: 'Terme', definition: '<p>Def</p>' }]
    const tabs = createBlock('tab_container')
    if (tabs.type !== 'tab_container') throw new Error('type inattendu')
    tabs.tabs = [{ title: 'Un', children: [] }]

    expect(toApiBlocks([carousel, glossary, tabs])).toEqual([
      { type: 'carousel', images: [{ image: 12, description: 'Légende' }] },
      { type: 'glossary', entries: [{ term: 'Terme', definition: '<p>Def</p>' }] },
      { type: 'tab_container', tabs: [{ title: 'Un', children: [] }] },
    ])
  })

  it('nettoie les liens externes : titre vide et champs optionnels vides omis', () => {
    const links = createBlock('links')
    if (links.type !== 'links') throw new Error('type inattendu')
    links.items = [
      { title: 'Bande-annonce', url: 'https://example.com/t', kind: 'trailer', description: '' },
      { title: 'Site', url: 'https://example.com', kind: '', description: 'Officiel' },
    ]

    expect(toApiBlocks([links])).toEqual([
      {
        type: 'links',
        items: [
          { title: 'Bande-annonce', url: 'https://example.com/t', kind: 'trailer' },
          { title: 'Site', url: 'https://example.com', description: 'Officiel' },
        ],
      },
    ])
  })

  it("garde l'ordre des blocs", () => {
    const a = createBlock('video')
    const b = createBlock('map')
    expect(toApiBlocks([b, a]).map((block) => block.type)).toEqual(['map', 'video'])
  })
})

describe('toEditorBlocks', () => {
  it("ajoute un uid à chaque bloc, enfants compris, sans altérer l'aller-retour", () => {
    const blocks: Block[] = [
      { type: 'paragraph', content: '<p>Salut</p>' },
      {
        type: 'section',
        title: 'Détails',
        spoiler: true,
        children: [{ type: 'list', ordered: false, items: ['<p>un</p>'] }],
      },
      {
        type: 'tab_container',
        tabs: [{ title: 'A', children: [{ type: 'map', latitude: 1, longitude: 2 }] }],
      },
    ]

    const editor = toEditorBlocks(blocks)
    const uids = new Set<string>()
    const collect = (list: EditorBlock[]) =>
      list.forEach((b) => {
        uids.add(b.uid)
        if (b.type === 'section') collect(b.children)
        if (b.type === 'tab_container') b.tabs.forEach((t) => collect(t.children))
      })
    collect(editor)

    expect(uids.size).toBe(5)
    expect(toApiBlocks(editor)).toEqual(blocks)
  })

  it('accepte une liste absente', () => {
    expect(toEditorBlocks(undefined)).toEqual([])
  })
})

describe('errorsUnder', () => {
  const errors = {
    'blocks[1].content': 'a',
    'blocks[1].children[0].content': 'b',
    'blocks[10].content': 'c',
    blocks: 'd',
  }

  it('garde les erreurs du chemin et de ses descendants uniquement', () => {
    expect(errorsUnder(errors, 'blocks[1]')).toEqual({
      'blocks[1].content': 'a',
      'blocks[1].children[0].content': 'b',
    })
  })

  it('ne confond pas blocks[1] et blocks[10]', () => {
    expect(Object.keys(errorsUnder(errors, 'blocks[10]'))).toEqual(['blocks[10].content'])
  })
})

describe('countBlocks', () => {
  it('compte les blocs imbriqués', () => {
    const section = createBlock('section')
    if (section.type !== 'section') throw new Error('type inattendu')
    section.children = [createBlock('video'), createBlock('map')]
    const tabs = createBlock('tab_container')
    if (tabs.type !== 'tab_container') throw new Error('type inattendu')
    tabs.tabs = [{ title: 'A', children: [createBlock('video')] }]

    expect(countBlocks([section, tabs, createBlock('video')])).toBe(6)
  })
})

describe('moveItem', () => {
  it('déplace un élément sans modifier la liste source', () => {
    const list = ['a', 'b', 'c']
    expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(list).toEqual(['a', 'b', 'c'])
  })

  it('ignore un déplacement hors limites', () => {
    const list = ['a', 'b']
    expect(moveItem(list, 0, -1)).toBe(list)
    expect(moveItem(list, 1, 2)).toBe(list)
  })
})
