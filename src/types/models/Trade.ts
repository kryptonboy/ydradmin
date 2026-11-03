import type { MediaLink, NamedRef } from './Ref'

export type TradeStatus = 'negotiating' | 'accepted' | 'completed' | 'declined' | 'cancelled'

export const TRADE_STATUS_LABELS: Record<TradeStatus, string> = {
  negotiating: 'Négociation',
  accepted: 'Accepté',
  completed: 'Terminé',
  declined: 'Refusé',
  cancelled: 'Annulé',
}

/** Ligne d'une proposition (une révision de l'échange) : une carte donnée par un joueur. */
export interface TradeLine {
  id: number
  /** Numéro de la proposition à laquelle appartient la ligne */
  revision: number
  giverName?: string | null
  card: NamedRef & {
    /** Référence unique de l'impression (ex. LOB-FR001) */
    reference: string
    /** Passcode, partagé par plusieurs impressions */
    code?: string | null
    image?: MediaLink | null
    extension: NamedRef
  }
  rarity: NamedRef
  condition: 'MT' | 'NM' | 'EX' | 'GD' | 'LP' | 'PL' | 'PO' | null
  language: 'fr' | 'en' | 'de' | 'it' | 'es' | 'pt' | 'ja' | 'ko' | 'zh'
  edition: 'first' | 'unlimited' | 'limited'
  gradingCompany?: NamedRef | null
  grade: number | null
  certificateNumber: string | null
  quantity: number
  /** Valeur indicative d'une copie au moment de la proposition (euros) */
  unitValue: number | null
  /** Exemplaires arrivés selon le receveur (vide avant sa confirmation) */
  receivedQuantity: number | null
  wishlistReduced: number
}

/** Échange entre deux joueurs, vu par la modération. */
export interface Trade {
  '@id': string
  id: number
  status: TradeStatus
  /** Numéro de la proposition en cours */
  revision: number
  /** Une partie des cartes n'est pas arrivée */
  partial: boolean
  proposerName: string | null
  recipientName: string | null
  /** Joueur dont c'est le tour de répondre */
  turnName: string | null
  proposerConfirmed: boolean
  recipientConfirmed: boolean
  /** Chaque joueur choisit à la confirmation si l'échange met à jour sa collection */
  proposerUpdatesCollection: boolean
  recipientUpdatesCollection: boolean
  /** File de médiation : aucune demande, demandée, prise en charge */
  mediationState: 'none' | 'requested' | 'taken'
  mediationRequestedByName?: string | null
  mediationRequestedAt?: string | null
  mediatorName?: string | null
  createdAt: string
  updatedAt: string
  /** Valeurs en euros de la proposition en cours */
  balance?: Record<string, number>
  /** Toutes les révisions */
  lines: TradeLine[]
}

export interface TradeMessage {
  '@id': string
  id: number
  content: string
  createdAt: string
  tradeId: number | null
  authorName: string | null
}

export interface TradeRating {
  '@id': string
  id: number
  score: number
  comment: string | null
  createdAt: string
  tradeId: number | null
  raterName: string | null
  ratedName: string | null
}

export type MediationState = Trade['mediationState']

export const MEDIATION_LABELS: Record<MediationState, string> = {
  none: 'Aucune',
  requested: 'À traiter',
  taken: 'Pris en charge',
}
