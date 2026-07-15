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
  resolveStudyAccess,
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

const INVITE_TOKEN_KEY = 'pendingInviteToken'

const publicPages = [
  '/signin',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/invite',
]

router.beforeEach(async (to, from, next) => {
  const {
    authorize = [],
    studyCapability = null,
    studyOwnerOnly = false,
    studyRouteBase = '',
  } = to.meta || {}
  let user = store.state.Auth.user

  /**
   * 1. Store invite token ONLY when visiting the invite route
   */
  if (to.path === '/invite') {
    const inviteToken = to.query.token

    if (typeof inviteToken === 'string' && inviteToken.length > 0) {
      localStorage.setItem(INVITE_TOKEN_KEY, inviteToken)
    }
  }

  /**
   * 2. Ensure user session is restored before applying route rules
   */
  if (!user) {
    const authUser = await store.dispatch('autoSignIn')
    user = store.state.Auth.user

    // Redirect unverified users to email verification page
    if (
      authUser &&
      authUser.emailVerified === false &&
      !publicPages.includes(to.path)
    ) {
      return next('/verify-email')
    }
  }

  /**
   * 3. Allow full access for accessibility preview routes
   */
  const isAccessibilityPreview =
    to.path.includes('/accessibility/') && to.path.includes('/preview/')

  if (isAccessibilityPreview) {
    return next()
  }

  /**
   * 4. Allow public pages without authentication
   */
  if (publicPages.includes(to.path)) {
    return next()
  }

  /**
   * 5. Enforce role-based access control
   */
  if (authorize.length) {
    if (!user || !authorize.includes(user.accessLevel)) {
      return next(redirect())
    }
  }

  if ((studyCapability || studyOwnerOnly) && to.params.id && user) {
    const studyId = to.params.id
    let study = store.getters.test

    if (study?.id !== studyId) {
      await store.dispatch('getStudy', { id: studyId })
      study = store.getters.test
    }

    const denied =
      study?.id !== studyId ||
      (studyOwnerOnly
        ? !resolveStudyAccess(study, user).isOwner
        : !hasStudyCapability(study, user, studyCapability))

    if (denied) {
      store.commit('SET_TOAST', {
        message: 'AccessNotAllowed.noAccess',
        type: 'error',
      })
      return next(
        getStudyFallbackPath(
          study?.id === studyId ? study : null,
          user,
          studyRouteBase,
        ),
      )
    }
  }

  next()
})

function redirect() {
  const user = store.state.Auth.user

  if (!user) return '/signin'

  const level = user.accessLevel

  if (level === 0) return '/superadmin'
  if (level === 1) return '/admin'

  return '/signin'
}

export default router
