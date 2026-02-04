import { createRouter, createWebHistory } from 'vue-router'
import Public from '@/router/modules/public.js'
import Admin from '@/router/modules/admin.js'
import SuperAdmin from '@/router/modules/superAdmin.js'
import CardSorting from '@/ux/CardSorting/router.js'
import HeuristicRoutes from '@/ux/Heuristic/router.js'
import accessibilityRoutes from '@/ux/accessibility/router.js'
import UserTestRoutes from '@/ux/UserTest/router.js'
import store from '@/store'
import { auth } from '@/app/plugins/firebase'

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

  // Special handling for accessibility preview routes - allow complete public access
  const isAccessibilityPreview =
    to.path.includes('/accessibility/') && to.path.includes('/preview/')

  if (isAccessibilityPreview) {
    return next() // Allow immediate access without any checks
  }

  if (!user) {
    await store.dispatch('autoSignIn')
    user = store.state.Auth.user
  }

  if (to.path === '/') return next(redirect())

  if (authorize.length && to.path !== '/signin' && !to.params.token) {
    if (!user || !authorize.includes(user.accessLevel)) {
      return next(redirect())
    }
    
    // Check if user email is verified for protected routes
    // Check both Vuex store and Firebase auth state
    const firebaseUser = auth.currentUser
    const isEmailVerified = user?.emailVerified || (firebaseUser && firebaseUser.emailVerified)
    
    if (!isEmailVerified && to.path !== '/verify-email') {
      return next('/verify-email')
    }
  }

  if (user && ['/signin', '/signup'].includes(to.path)) {
    return next(redirect())
  }

  next()
})

function redirect() {
  const user = store.state.Auth.user
  const firebaseUser = auth.currentUser

  if (!user) return '/signin'
  
  const isEmailVerified = user?.emailVerified || (firebaseUser && firebaseUser.emailVerified)
  if (!isEmailVerified) return '/verify-email'
  
  const level = user.accessLevel
  if (level === 0) return '/superadmin'
  if (level === 1) return '/admin'
  return '/signin'
}

export default router
