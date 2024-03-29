import { auth } from '@/firebase'
import store from '@/store/index'
import { onAuthStateChanged } from 'firebase/auth'

export function autoSignIn() {
  return new Promise((resolve) => {
    if (!store.state.Auth.user) {
      onAuthStateChanged(auth, async (user) => {
        if (user && !store.state.Auth.user) {
          await store.dispatch('autoSignIn', user)
        }
        resolve()
      })
    } else {
      resolve()
    }
  })
}

export const isAuthorizedAndOwnsTest = async (to, from, next) => {
  const user = store.getters['Auth/user'];

  if (user) {
    const allowedRoles = to.meta.authorize;
    if (allowedRoles.includes(user.accessLevel)) {
      try {
        const isInvited = await store.dispatch('getPublicTest', to.params.id);
        console.log(isInvited)
        const isSharedWithUser = store.dispatch('getSharedWithMeTests');
        const testExists = isInvited || isSharedWithUser.some(test => test.id === to.params.id);
        
        if (testExists) {
          next();
        } else {
          next('/');
        }
      } catch (error) {
        console.error('Error checking if user is authorized to access the test:', error);
        next('/');
      }
    } else {
      next('/');
    }
  } else {
    next('/login');
  }
}

export function redirect() {
    if (!store.state.Auth.user) {
        return '/'
    }

    const level = store.state.Auth.user.accessLevel

    if (level == 0) {
        return '/superadmin'
    } else if (level == 1) {
        return '/testslist'
    } else {
        return '/home'
    }
}
