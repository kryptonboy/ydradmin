import type { Block, BlockType, EditorBlock, LeafBlock, Tab } from '@/types/content-blocks'

let counter = 0
export function newUid(): string {
  counter += 1
  return `b${Date.now().toString(36)}${counter}`
}

/** Bloc vide du type demandé, avec un identifiant d'édition. */
export function createBlock(type: BlockType): EditorBlock {
  const uid = newUid()
  switch (type) {
    case 'paragraph':
      return { uid, type, content: '' }
    case 'quote':
      return { uid, type, content: '', author: '' }
    case 'image':
      return { uid, type, image: null, title: '', alt: '' }
    case 'carousel':
      return { uid, type, images: [{ image: null, title: '', description: '' }] }
    case 'attachment':
      return { uid, type, name: '', description: '', attachment: null }
    case 'list':
      return { uid, type, ordered: false, items: [''] }
    case 'glossary':
      return { uid, type, title: '', entries: [{ term: '', definition: '' }] }
    case 'map':
      return { uid, type, latitude: null, longitude: null }
    case 'table':
      return { uid, type, content: '' }
    case 'video':
      return { uid, type, url: '' }
    case 'section':
      return { uid, type, title: '', spoiler: false, children: [] }
    case 'tab_container':
      return { uid, type, tabs: [{ title: '', children: [] }] }
  }
}

/** Ajoute un `uid` à chaque bloc (récursivement) pour l'édition. */
export function toEditorBlocks(blocks: Block[] | undefined): EditorBlock[] {
  return (blocks ?? []).map((block): EditorBlock => {
    const uid = newUid()
    if (block.type === 'section') {
      return { ...block, uid, children: toEditorBlocks(block.children) }
    }
    if (block.type === 'tab_container') {
      return {
        ...block,
        uid,
        tabs: block.tabs.map((tab) => ({ ...tab, children: toEditorBlocks(tab.children) })),
      }
    }
    return { ...(block as LeafBlock), uid }
  })
}

/** Retire les valeurs vides : le serveur valide les champs présents et refuse les inconnus. */
function clean<T extends object>(value: T): T {
  const result: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(value)) {
    if (v === '' || v === null || v === undefined) continue
    result[key] = v
  }
  return result as T
}

/** Charge utile envoyée à l'API : sans `uid` ni champ vide. */
export function toApiBlocks(blocks: EditorBlock[]): Block[] {
  return blocks.map((block): Block => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { uid, ...rest } = block
    if (rest.type === 'section') {
      return clean({ ...rest, children: toApiBlocks(rest.children) })
    }
    if (rest.type === 'tab_container') {
      return {
        ...rest,
        tabs: rest.tabs.map(
          (tab): Tab<Block> => clean({ ...tab, children: toApiBlocks(tab.children) }),
        ),
      }
    }
    if (rest.type === 'carousel') {
      return { ...rest, images: rest.images.map((image) => clean(image)) }
    }
    if (rest.type === 'glossary') {
      return clean({ ...rest, entries: rest.entries.map((entry) => clean(entry)) })
    }
    return clean(rest)
  })
}

/** Erreurs de validation (`blocks[2].children[0].content` → message) qui concernent le chemin. */
export function errorsUnder(errors: Record<string, string>, path: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, message] of Object.entries(errors)) {
    if (key === path || key.startsWith(`${path}.`) || key.startsWith(`${path}[`)) {
      result[key] = message
    }
  }
  return result
}

/** Compte les blocs, imbriqués compris. */
export function countBlocks(blocks: EditorBlock[]): number {
  return blocks.reduce((total, block) => {
    if (block.type === 'section') return total + 1 + countBlocks(block.children)
    if (block.type === 'tab_container') {
      return total + 1 + block.tabs.reduce((n, tab) => n + countBlocks(tab.children), 0)
    }
    return total + 1
  }, 0)
}

/** Déplace un élément d'une liste (boutons haut/bas des listes internes). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const copy = [...list]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}
