import type { DeckInput } from '../api-types'

/** La modération ne modifie que `hidden` (PATCH) : le reste du deck appartient au joueur. */
export type DeckForm = Partial<DeckInput>
