/** Les échanges sont lus par l'administration, jamais écrits : seules les actions existent. */
export type TradeForm = Record<string, never>
