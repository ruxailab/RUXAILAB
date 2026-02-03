import { ref } from 'vue'
import { useStore } from 'vuex'
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  deleteUser,
} from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import { showError, showSuccess } from '../../../shared/utils/toast'

const SHARED_ERRORS = {
  'auth/network-request-failed': 'errors.networkError',
  'auth/requires-recent-login': 'profile.recentLoginRequired',
}

const GOOGLE_ERRORS = {
  ...SHARED_ERRORS,
  'auth/popup-closed-by-user': 'errors.authenticationCancelled',
  'auth/cancelled-popup-request': 'errors.authenticationCancelled',
  'auth/popup-blocked': 'errors.popupBlocked',
}

const EMAIL_ERRORS = {
  ...SHARED_ERRORS,
  'auth/wrong-password': 'errors.incorrectPassword',
  'auth/invalid-credential': 'errors.incorrectPassword',
  'auth/too-many-requests': 'errors.tooManyAttempts',
}

export function useDeleteAccount() {
  const store = useStore()

  const isDeleting = ref(false)
  const deleteStep = ref(1)
  const deleteConfirmText = ref('')
  const userPassword = ref('')

  const handleAuthError = (error, errorMap) => {
    const messageKey = errorMap[error.code] || 'profile.accountDeletionFailed'
    showError(messageKey)
  }

  const deleteAccount = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.uid)
      await deleteDoc(userDocRef)

      try {
        await store.dispatch('deleteAuth', user.uid)
      } catch (storeError) {
        return storeError
      }

      await deleteUser(user)

      showSuccess('profile.accountDeletedSuccess')

      await signOut()
    } catch (error) {
      if (error.code === 'permission-denied') {
        showError('profile.permissionDenied')
      } else if (error.code === 'not-found') {
        try {
          await deleteUser(user)
          showSuccess('profile.accountDeletedSuccess')
          await signOut()
        } catch (authError) {
          showError('profile.accountDeletionFailed')
          throw authError
        }
      } else {
        showError('profile.accountDeletionFailed')
        throw error
      }
    }
  }

  const signOut = async () => {
    try {
      await store.dispatch('logout', { silent: true })
      setTimeout(() => {
        globalThis.location.href = '/signin'
      }, 500)
    } catch (error) {
      globalThis.location.href = '/signin'
      return error
    }
  }

  const handleDeleteConfirmText = async () => {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      showError('profile.userNotFound')
      return
    }

    const hasGoogleProvider = user.providerData.some(
      (provider) => provider.providerId === 'google.com',
    )

    if (!hasGoogleProvider) {
      deleteStep.value = 2
      return
    }

    try {
      isDeleting.value = true
      await reauthenticateWithPopup(user, new GoogleAuthProvider())
      await deleteAccount(user)
    } catch (error) {
      handleAuthError(error, GOOGLE_ERRORS)
    } finally {
      isDeleting.value = false
    }
  }

  const handleDeleteAccount = async () => {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      showError('profile.userNotFound')
      return
    }

    if (!userPassword.value) {
      showError('profile.passwordRequired')
      return
    }

    try {
      isDeleting.value = true

      const cred = EmailAuthProvider.credential(user.email, userPassword.value)
      await reauthenticateWithCredential(user, cred)

      await deleteAccount(user)
    } catch (error) {
      handleAuthError(error, EMAIL_ERRORS)
    } finally {
      isDeleting.value = false
    }
  }

  const resetDeleteDialog = () => {
    deleteStep.value = 1
    deleteConfirmText.value = ''
    userPassword.value = ''
    isDeleting.value = false
  }

  return {
    isDeleting,
    deleteStep,
    deleteConfirmText,
    userPassword,
    handleDeleteConfirmText,
    handleDeleteAccount,
    resetDeleteDialog,
  }
}
