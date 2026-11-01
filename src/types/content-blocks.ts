/**
 * Blocs de contenu éditorial (voir docs/content-blocks.md dans le dépôt de l'API).
 * L'OpenAPI type `blocks` comme une liste d'objets génériques : ces types sont écrits à la main.
 * Les médias sont référencés par l'identifiant entier d'un MediaObject.
 */

export interface ParagraphBlock {
  type: 'paragraph'
  content: string
}

export interface QuoteBlock {
  type: 'quote'
  content: string
  author?: string
}

export interface ImageBlock {
  type: 'image'
  image: number | null
  title?: string
  alt?: string
}

export interface CarouselImage {
  image: number | null
  title?: string
  description?: string
}

export interface CarouselBlock {
  type: 'carousel'
  images: CarouselImage[]
}

export interface AttachmentBlock {
  type: 'attachment'
  name: string
  description?: string
  attachment: number | null
}

export interface ListBlock {
  type: 'list'
  ordered: boolean
  items: string[]
}

export interface GlossaryEntry {
  term: string
  definition: string
}

export interface GlossaryBlock {
  type: 'glossary'
  title?: string
  entries: GlossaryEntry[]
}

export interface MapBlock {
  type: 'map'
  latitude: number | null
  longitude: number | null
}

export interface TableBlock {
  type: 'table'
  content: string
}

export interface VideoBlock {
  type: 'video'
  url: string
}

/** Blocs sans enfants */
export type LeafBlock =
  | ParagraphBlock
  | QuoteBlock
  | ImageBlock
  | CarouselBlock
  | AttachmentBlock
  | ListBlock
  | GlossaryBlock
  | MapBlock
  | TableBlock
  | VideoBlock

/** `C` est le type des blocs enfants (avec ou sans identifiant d'édition). */
export interface SectionBlock<C> {
  type: 'section'
  title?: string
  spoiler: boolean
  children: C[]
}

export interface Tab<C> {
  title: string
  children: C[]
}

export interface TabContainerBlock<C> {
  type: 'tab_container'
  tabs: Tab<C>[]
}

/** Bloc tel qu'échangé avec l'API */
export type Block = LeafBlock | SectionBlock<Block> | TabContainerBlock<Block>

/** Bloc dans l'éditeur : un `uid` stable sert de clé pour le glisser-déposer. */
export type EditorBlock = (
  | LeafBlock
  | SectionBlock<EditorBlock>
  | TabContainerBlock<EditorBlock>
) & {
  uid: string
}

export type BlockType = Block['type']

/** Média référencé par un bloc (table `media` du détail d'une actualité) */
export interface MediaRef {
  id: number
  contentUrl?: string | null
  context?: string | null
}

export type MediaMap = Record<number, MediaRef>

/** Imbrication maximale acceptée par l'API */
export const MAX_DEPTH = 6

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: 'Paragraphe',
  quote: 'Citation',
  image: 'Image',
  carousel: 'Carrousel',
  attachment: 'Pièce jointe',
  list: 'Liste',
  glossary: 'Glossaire',
  map: 'Carte',
  table: 'Tableau',
  video: 'Vidéo',
  section: 'Section',
  tab_container: 'Onglets',
}
