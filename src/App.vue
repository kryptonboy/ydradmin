<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { AppLink } from './components'
import { useAuthStore } from '@/stores'
import { computed } from 'vue'
const authStore = useAuthStore()
const route = useRoute()

const isCardManagementDropdownActive = computed(() => route.path.startsWith('/card_management'))
const isContentDropdownActive = computed(() => route.path.startsWith('/content'))
const isAnimeMangaDropdownActive = computed(() => route.path.startsWith('/anime_manga'))
const isVideoGameDropdownActive = computed(() => route.path.startsWith('/video_game'))
</script>

<template>
  <nav v-if="authStore.user" class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <AppLink to="/" class="nav-link" activeClass="active"> Accueil </AppLink>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              :class="{ active: isCardManagementDropdownActive }"
              href="#"
              id="cardManagementDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              >Gestion des cartes</a
            >
            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="cardManagementDropdown">
              <li>
                <AppLink to="/card_management/card" class="dropdown-item" activeClass="active">
                  Cartes
                </AppLink>
                <AppLink
                  to="/card_management/abstract_card"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Cartes abstraites
                </AppLink>
                <AppLink
                  to="/card_management/card_group"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Groupes de cartes
                </AppLink>
              </li>
              <li>
                <AppLink to="/card_management/extension" class="dropdown-item" activeClass="active">
                  Extensions
                </AppLink>
              </li>
              <li>
                <AppLink to="/card_management/rarity" class="dropdown-item" activeClass="active">
                  Raretés
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/grading_company"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Sociétés de gradation
                </AppLink>
              </li>
              <li>
                <AppLink to="/card_management/card_type" class="dropdown-item" activeClass="active">
                  Types de carte
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/card_sub_type"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Sous-Types de carte
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/monster_attribute"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Attributs de monstre
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/monster_type"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Types de monstre
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/monster_sub_type"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Sous-Types de monstre
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/monster_effect"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Effets de monstre
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/extension_type"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Types d'extension
                </AppLink>
              </li>
              <li>
                <AppLink to="/card_management/tag" class="dropdown-item" activeClass="active">
                  Tags
                </AppLink>
              </li>
              <li>
                <AppLink to="/card_management/country" class="dropdown-item" activeClass="active">
                  Pays
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/game_format"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Formats de jeu
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/card_management/restriction"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Restrictions
                </AppLink>
              </li>
              <li>
                <AppLink to="/card_management/ruling" class="dropdown-item" activeClass="active">
                  Rulings
                </AppLink>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              :class="{ active: isContentDropdownActive }"
              href="#"
              id="contentDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              >Contenu</a
            >
            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="contentDropdown">
              <li>
                <AppLink to="/content/actuality" class="dropdown-item" activeClass="active">
                  Actualités
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/content/actuality_category"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Catégories d'actualités
                </AppLink>
              </li>
              <li>
                <AppLink to="/content/actuality_comment" class="dropdown-item" activeClass="active">
                  Commentaires
                </AppLink>
              </li>
              <li>
                <AppLink to="/content/smiley" class="dropdown-item" activeClass="active">
                  Smileys
                </AppLink>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              :class="{ active: isAnimeMangaDropdownActive }"
              href="#"
              id="animeMangaDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              >Animés &amp; mangas</a
            >
            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="animeMangaDropdown">
              <li>
                <AppLink to="/anime_manga/anime" class="dropdown-item" activeClass="active">
                  Animés
                </AppLink>
              </li>
              <li>
                <AppLink to="/anime_manga/episode" class="dropdown-item" activeClass="active">
                  Épisodes
                </AppLink>
              </li>
              <li>
                <AppLink to="/anime_manga/manga" class="dropdown-item" activeClass="active">
                  Mangas
                </AppLink>
              </li>
              <li>
                <AppLink to="/anime_manga/chapter" class="dropdown-item" activeClass="active">
                  Chapitres
                </AppLink>
              </li>
              <li>
                <AppLink to="/anime_manga/movie" class="dropdown-item" activeClass="active">
                  Films
                </AppLink>
              </li>
              <li>
                <AppLink to="/anime_manga/character" class="dropdown-item" activeClass="active">
                  Personnages
                </AppLink>
              </li>
              <li>
                <AppLink to="/anime_manga/gender" class="dropdown-item" activeClass="active">
                  Genres
                </AppLink>
              </li>
              <li>
                <AppLink
                  to="/anime_manga/astrological_sign"
                  class="dropdown-item"
                  activeClass="active"
                >
                  Signes astrologiques
                </AppLink>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              :class="{ active: isVideoGameDropdownActive }"
              href="#"
              id="videoGameDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              >Jeux vidéo</a
            >
            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="videoGameDropdown">
              <li>
                <AppLink to="/video_game/game" class="dropdown-item" activeClass="active">
                  Jeux vidéo
                </AppLink>
              </li>
              <li>
                <AppLink to="/video_game/support" class="dropdown-item" activeClass="active">
                  Supports
                </AppLink>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <AppLink to="/decks" class="nav-link" activeClass="active">Decks</AppLink>
          </li>
          <li class="nav-item">
            <AppLink to="/trades" class="nav-link" activeClass="active">Échanges</AppLink>
          </li>
          <li class="nav-item">
            <AppLink to="/users" class="nav-link" activeClass="active">Utilisateurs</AppLink>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarUserDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <font-awesome-icon :icon="['far', 'circle-user']" size="lg" />
            </a>
            <ul
              class="dropdown-menu dropdown-menu-end dropdown-menu-dark"
              aria-labelledby="navbarUserDropdown"
            >
              <li>
                <a @click="authStore.logout()" class="dropdown-item">Logout</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container-fluid">
    <RouterView />
  </div>
</template>
