import type { InjectionKey, Ref } from 'vue'
import type { MediaMap } from '@/types/content-blocks'

/** Médias connus de l'éditeur (chargés avec l'actualité ou envoyés pendant l'édition) */
export const mediaMapKey: InjectionKey<MediaMap> = Symbol('mediaMap')

/** Erreurs de validation de l'API : `blocks[2].children[0].content` → message */
export const blockErrorsKey: InjectionKey<Ref<Record<string, string>>> = Symbol('blockErrors')
