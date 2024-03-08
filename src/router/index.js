import Vue from 'vue'
import VueRouter from 'vue-router'
import Public from '@/router/modules/public.js'
import Admin from '@/router/modules/admin.js'
import SuperAdmin from '@/router/modules/superAdmin.js'
import { autoSignIn, redirect } from '@/router/tools.js'
import store from '@/store/index.js'

Vue.use(VueRouter)

const routes = [...Public, ...Admin, ...SuperAdmin]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach(async (to, from, next) => {
  const { authorize, requiresInvitation } = to.meta

  await autoSignIn()

  const user = store.state.Auth.user

  if (
    authorize.length > 0 &&
    to.path !== '/signin' &&
    !to.params.token &&
    from.path !== '/signup'
  ) {
    if (!user) {
      return next(redirect())
    }

    if (!authorize.includes(user.accessLevel)) {
      return next(redirect())
    }
  }

  if (requiresInvitation && !user.invited) {
    //what to do if not invited
  }

  next()
})

export default router
