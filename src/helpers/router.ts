import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'
import {
  AbstractCardView,
  CardGroupView,
  CardSubTypeView,
  CardTypeView,
  CountryView,
  ExtensionTypeView,
  ExtensionView,
  HomeView,
  LoginView,
  MonsterAttributeView,
  MonsterSubTypeView,
  MosnterEffectView,
  RarityView,
  TagView,
} from '@/views'
import MonsterTypeView from '@/views/MonsterTypeView.vue'
import CardView from '@/views/CardView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  routes: [
    { path: '/', component: HomeView },
    { path: '/card_management/abstract_card', component: AbstractCardView },
    { path: '/card_management/card', component: CardView },
    { path: '/card_management/card_group', component: CardGroupView },
    { path: '/card_management/card_sub_type', component: CardSubTypeView },
    { path: '/card_management/card_type', component: CardTypeView },
    { path: '/card_management/country', component: CountryView },
    { path: '/card_management/extension', component: ExtensionView },
    { path: '/card_management/extension_type', component: ExtensionTypeView },
    { path: '/card_management/monster_attribute', component: MonsterAttributeView },
    { path: '/card_management/monster_effect', component: MosnterEffectView },
    { path: '/card_management/monster_sub_type', component: MonsterSubTypeView },
    { path: '/card_management/monster_type', component: MonsterTypeView },
    { path: '/card_management/rarity', component: RarityView },
    { path: '/card_management/tag', component: TagView },
    { path: '/login', component: LoginView },
  ],
})

router.beforeEach(async (to) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const auth = useAuthStore()

  if (!auth.isAuthChecked && !auth.isChecking) {
    await auth.loadFromStorage()
  }

  if (authRequired && !auth.user) {
    auth.returnUrl = to.fullPath
    return '/login'
  }

  if (to.path == '/login' && auth.user) {
    return '/'
  }
})

router.afterEach(() => {
  const dropdowns = document.querySelectorAll('.dropdown-menu.show')
  dropdowns.forEach((menu) => {
    const toggle = menu.previousElementSibling
    if (toggle) {
      const bsDropdown = bootstrap.Dropdown.getInstance(toggle)
      if (bsDropdown) {
        bsDropdown.hide()
      }
    }
  })
})
