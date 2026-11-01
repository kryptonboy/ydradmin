import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    {
      path: '/card_management/abstract_card',
      component: () => import('@/views/AbstractCardView.vue'),
    },
    { path: '/card_management/card', component: () => import('@/views/CardView.vue') },
    { path: '/card_management/card_group', component: () => import('@/views/CardGroupView.vue') },
    {
      path: '/card_management/card_sub_type',
      component: () => import('@/views/CardSubTypeView.vue'),
    },
    { path: '/card_management/card_type', component: () => import('@/views/CardTypeView.vue') },
    { path: '/card_management/country', component: () => import('@/views/CountryView.vue') },
    { path: '/card_management/extension', component: () => import('@/views/ExtensionView.vue') },
    {
      path: '/card_management/extension_type',
      component: () => import('@/views/ExtensionTypeView.vue'),
    },
    {
      path: '/card_management/monster_attribute',
      component: () => import('@/views/MonsterAttributeView.vue'),
    },
    {
      path: '/card_management/monster_effect',
      component: () => import('@/views/MonsterEffectView.vue'),
    },
    {
      path: '/card_management/monster_sub_type',
      component: () => import('@/views/MonsterSubTypeView.vue'),
    },
    {
      path: '/card_management/monster_type',
      component: () => import('@/views/MonsterTypeView.vue'),
    },
    { path: '/card_management/rarity', component: () => import('@/views/RarityView.vue') },
    { path: '/card_management/tag', component: () => import('@/views/TagView.vue') },
    { path: '/content/actuality', component: () => import('@/views/ActualityView.vue') },
    { path: '/content/actuality/new', component: () => import('@/views/ActualityEditView.vue') },
    {
      path: String.raw`/content/actuality/:id(\d+)`,
      component: () => import('@/views/ActualityEditView.vue'),
    },
    {
      path: '/content/actuality_category',
      component: () => import('@/views/ActualityCategoryView.vue'),
    },
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') },
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
