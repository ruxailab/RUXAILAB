import { createRouter, createWebHistory } from 'vue-router'
import Public from '@/router/modules/public.js'
import Admin from '@/router/modules/admin.js'
import SuperAdmin from '@/router/modules/superAdmin.js'
import CardSorting from '@/ux/CardSorting/router.js'
import HeuristicRoutes from '@/ux/Heuristic/router.js'
import accessibilityRoutes from '@/ux/accessibility/router.js'
import UserTestRoutes from '@/ux/UserTest/router.js'
import FocusGroupRoutes from '@/ux/FocusGroup/router.js'
import store from '@/store'
import {
  getStudyFallbackPath,
  hasStudyCapability,
} from '@/shared/utils/studyAccessPolicy'

const routes = [
  ...Public,
  ...Admin,
  ...SuperAdmin,
  ...CardSorting,
  ...accessibilityRoutes,
  ...HeuristicRoutes,
  ...UserTestRoutes,
  ...FocusGroupRoutes,
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const {
    authorize = [],
    studyCapability = null,
    studyRouteBase = '',
  } = to.meta || {}
  let user = store.state.Auth.user

  // Special handling for accessibility preview routes - allow complete public access
  const isAccessibilityPreview =
    to.path.includes('/accessibility/') && to.path.includes('/preview/')

  if (isAccessibilityPreview) {
    return next() // Allow immediate access without any checks
  }

   // Allow access to public pages even if user is logged in but email not verified
  const publicPages = ['/signin', '/signup', '/verify-email', '/forgot-password']
  if (publicPages.includes(to.path)) {
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

  if (studyCapability && to.params.id && user) {
    const studyId = to.params.id
    let study = store.getters.test

    if (study?.id !== studyId) {
      await store.dispatch('getStudy', { id: studyId })
      study = store.getters.test
    }

    if (study?.id !== studyId || !hasStudyCapability(study, user, studyCapability)) {
      store.commit('SET_TOAST', {
        message: 'AccessNotAllowed.noAccess',
        type: 'error',
      })
      return next(getStudyFallbackPath(study?.id === studyId ? study : null, user, studyRouteBase))
    }
  }

  next()
})

function redirect() {
  if (!store.state.Auth.user) return '/signin'
  const level = store.state.Auth.user.accessLevel
  if (level === 0) return '/superadmin'
  if (level === 1) return '/admin'
  return '/signin'
}

export default router
