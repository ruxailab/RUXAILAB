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

function isOpenPath(path) {
  return publicPages.includes(path) || path.startsWith('/mobile-task/')
}

function captureInviteToken(to) {
  if (to.path === '/invite') {
    const inviteToken = to.query?.token
    if (typeof inviteToken === 'string' && inviteToken.length > 0) {
      localStorage.setItem(INVITE_TOKEN_KEY, inviteToken)
    }
  }
}

async function restoreUserSession(currentStore, timeoutMs) {
  const controller = new AbortController()
  let timeoutId

  try {
    const authTimeout = new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        controller.abort()
        resolve(null)
      }, timeoutMs)
    })

    return await Promise.race([
      currentStore.dispatch('autoSignIn', { signal: controller.signal }),
      authTimeout,
    ])
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

async function checkStudyAccess(to, user, currentStore) {
  const {
    studyCapability = null,
    studyOwnerOnly = false,
    studyRouteBase = '',
  } = to.meta || {}
  const studyId = to.params?.id

  if (!studyId || (!studyCapability && !studyOwnerOnly)) {
    return null
  }

  let study = currentStore.getters?.test
  if (study?.id !== studyId) {
    await currentStore.dispatch('getStudy', { id: studyId })
    study = currentStore.getters?.test
  }

  const isOwner = studyOwnerOnly && resolveStudyAccess(study, user).isOwner
  const hasCap =
    !studyOwnerOnly && hasStudyCapability(study, user, studyCapability)
  const isDenied = study?.id !== studyId || (!isOwner && !hasCap)

  if (isDenied) {
    currentStore.commit('SET_TOAST', {
      message: 'AccessNotAllowed.noAccess',
      type: 'error',
    })
    return getStudyFallbackPath(
      study?.id === studyId ? study : null,
      user,
      studyRouteBase,
    )
  }

  return null
}

export async function beforeEachGuard(
  to,
  from,
  next,
  currentStore = store,
  timeoutMs = 5000,
) {
  const { authorize = [] } = to.meta || {}
  captureInviteToken(to)

  let user = currentStore.state?.Auth?.user
  if (!user) {
    const authUser = await restoreUserSession(currentStore, timeoutMs)
    user = currentStore.state?.Auth?.user

    if (
      authUser &&
      !authUser.isAnonymous &&
      authUser.emailVerified === false &&
      !isOpenPath(to.path)
    ) {
      return next('/verify-email')
    }
  }

  const isAccessibilityPreview =
    to.path?.includes('/accessibility/') && to.path?.includes('/preview/')
  if (isAccessibilityPreview) {
    return next()
  }

  if (isOpenPath(to.path)) {
    return next()
  }

  if (to.path === '/') {
    return next(redirect(currentStore))
  }

  if (
    user?.isFallback &&
    (to.meta?.studyCapability || to.meta?.studyOwnerOnly)
  ) {
    return next('/signin')
  }

  if (
    authorize.length &&
    (!user || user.isFallback || !authorize.includes(user.accessLevel))
  ) {
    return next(redirect(currentStore))
  }

  if (user) {
    const fallbackPath = await checkStudyAccess(to, user, currentStore)
    if (fallbackPath) {
      return next(fallbackPath)
    }
  }

  next()
}

router.beforeEach((to, from, next) => beforeEachGuard(to, from, next))

export function redirect(currentStore = store) {
  const user = currentStore.state?.Auth?.user

  if (!user || user.isFallback) return '/signin'

  const level = user.accessLevel

  if (level === 0) return '/superadmin'
  if (level === 1) return '/admin'

  return '/signin'
}

export default router
