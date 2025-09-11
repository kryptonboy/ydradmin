<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { AppLink } from './components'
import { useAuthStore } from '@/stores'
import { computed } from 'vue'
const authStore = useAuthStore()
const route = useRoute()

const isCardManagementDropdownActive = computed(() => route.path.startsWith('/card_management'))
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
                <AppLink to="/card_management/extension" class="dropdown-item" activeClass="active">
                  Extensions
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
            </ul>
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
