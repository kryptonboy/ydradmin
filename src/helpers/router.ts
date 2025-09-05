import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'
import { HomeView, LoginView } from '@/views'
import TagView from '@/views/TagView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/tag', component: TagView },
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
