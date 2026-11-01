import { blockErrorsKey, mediaMapKey } from '@/components/content/injection'
import { countBlocks, toApiBlocks, toEditorBlocks } from '@/helpers/content-blocks'
import type { Block, EditorBlock, MediaMap } from '@/types/content-blocks'
import { computed, provide, reactive, ref } from 'vue'

/**
 * État de l'éditeur de blocs d'une page (actualité, épisode, chapitre...) : les blocs, les médias
 * connus et les erreurs de l'API, partagés avec les composants de `components/content`.
 * À appeler depuis `setup`.
 */
export function useBlockContent() {
  const blocks = ref<EditorBlock[]>([])
  const mediaMap = reactive<MediaMap>({})
  const blockErrors = ref<Record<string, string>>({})
  provide(mediaMapKey, mediaMap)
  provide(blockErrorsKey, blockErrors)

  const blockCount = computed(() => countBlocks(blocks.value))
  const blockErrorCount = computed(() => Object.keys(blockErrors.value).length)

  function clear() {
    blocks.value = []
    Object.keys(mediaMap).forEach((key) => delete mediaMap[Number(key)])
    blockErrors.value = {}
  }

  /** Charge le contenu d'une ressource (champs `blocks` et `media` du détail). */
  function load(apiBlocks: Block[] | undefined, media: MediaMap | undefined) {
    clear()
    Object.assign(mediaMap, media ?? {})
    blocks.value = toEditorBlocks(apiBlocks)
  }

  /** Blocs au format de l'API (sans identifiant d'édition ni champ vide). */
  function toPayload(): Block[] {
    return toApiBlocks(blocks.value)
  }

  /**
   * Range les violations de contenu (`blocks[2].children[0].content`) dans les erreurs de l'éditeur
   * et renvoie les autres, à rattacher aux champs du formulaire.
   */
  function splitViolations(violations: Record<string, string>): Record<string, string> {
    const fields: Record<string, string> = {}
    const content: Record<string, string> = {}
    for (const [path, message] of Object.entries(violations)) {
      if (path === 'blocks' || path.startsWith('blocks[') || path.startsWith('blocks.')) {
        content[path] = message
      } else {
        fields[path] = message
      }
    }
    blockErrors.value = content
    return fields
  }

  return {
    blocks,
    mediaMap,
    blockErrors,
    blockCount,
    blockErrorCount,
    clear,
    load,
    toPayload,
    splitViolations,
  }
}
