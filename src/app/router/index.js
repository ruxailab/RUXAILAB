import { createRouter, createWebHistory } from 'vue-router'
import Public from '@/router/modules/public.js'
import Admin from '@/router/modules/admin.js'
import SuperAdmin from '@/router/modules/superAdmin.js'
import CardSorting from '@/ux/CardSorting/router.js'
import HeuristicRoutes from '@/ux/Heuristic/router.js'
import accessibilityRoutes from '@/ux/accessibility/router.js'
import UserTestRoutes from '@/ux/UserTest/router.js'
import store from '@/store'

const routes = [
  ...Public,
  ...Admin,
  ...SuperAdmin,
  ...CardSorting,
  ...accessibilityRoutes,
  ...HeuristicRoutes,
  ...UserTestRoutes,
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  return next()
})

function redirect() {
  if (!store.state.Auth.user) return '/signin'
  const level = store.state.Auth.user.accessLevel

  if (level === 4 || level === 0) return '/superadmin'
  if (level === 1) return '/admin'

  return '/signin'
}

export default router
