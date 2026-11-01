/** Relation lue depuis l'API : l'IRI et l'identifiant (pas les champs de la cible). */
export interface Ref {
  '@id': string
  id?: number
}

/** Relation avec son nom (animé, manga, arc, personnage, genre, signe, support...). */
export interface NamedRef extends Ref {
  name: string
}

/** Saison : libellé = numéro de saison. */
export interface SeasonRef extends Ref {
  seasonNumber?: number | null
}

/** Épisode : libellé = titre et numéro. */
export interface EpisodeRef extends Ref {
  title: string
  episodeNumber?: number | null
}

/** Chapitre : libellé = titre et numéro. */
export interface ChapterRef extends Ref {
  title: string
  chapterNumber?: number | null
}

/** Jeu vidéo : libellé = titre. */
export interface VideoGameRef extends Ref {
  title: string
}

/** Média lu avec l'URL de son contenu (chemin relatif au domaine de l'API). */
export interface MediaLink extends Ref {
  contentUrl?: string | null
}
