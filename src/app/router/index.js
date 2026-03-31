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
  const { authorize = [] } = to.meta || {}
  let user = store.state.Auth.user

  // Special handling for accessibility public routes - allow complete access
  const isAccessibilityPublicRoute =
    to.path.startsWith('/accessibility/') &&
    (!to.meta.authorize || to.meta.authorize.length === 0)

  if (isAccessibilityPublicRoute) {
    return next()
  }

  // Allow access to public pages
  const publicPages = ['/signin', '/signup', '/verify-email', '/forgot-password']
  if (publicPages.includes(to.path)) {
    // If already logged in, redirect to dashboard
    if (user && (to.path === '/signin' || to.path === '/signup')) {
      return next(redirect())
    }
    return next()
  }

  if (!user) {
    const authUser = await store.dispatch('autoSignIn')
    user = store.state.Auth.user
    // If user is logged in but email not verified, redirect to verify-email
    if (authUser && authUser.emailVerified === false && !publicPages.includes(to.path)) {
        return next('/verify-email')
    }
  }

  if (to.path === '/') return next(redirect())

  if (authorize.length && to.path !== '/signin' && !to.params.token) {
    if (!user || !authorize.includes(user.accessLevel)) {
      return next(redirect())
    }
  }

  next()
})

function redirect() {
  const { user } = store.state.Auth
  if (!user) return '/signin'
  const level = user.accessLevel
  if (level === 0) return '/superadmin'
  if (level === 1) return '/admin'
  return '/signin'
}

export default router
