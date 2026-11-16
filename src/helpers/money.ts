/** Montant en euros à la française (« 12,50 € »), tiret si absent */
export const formatEuros = (value: number | null | undefined) =>
  value == null ? '—' : `${value.toFixed(2).replace('.', ',')} €`
