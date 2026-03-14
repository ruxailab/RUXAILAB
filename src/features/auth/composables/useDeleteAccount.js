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

  const deleteAccount = async (user, password) => {
    try {
      await store.dispatch('deleteAuth', { user, password })

      showSuccess('profile.accountDeletedSuccess')
      await signOut()
    } catch (error) {
      showError('profile.accountDeletionFailed')
      throw error
    }
  }

  const signOut = async () => {
    setTimeout(() => {
      globalThis.location.href = '/signin'
    }, 500)
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
      await deleteAccount(user, userPassword.value)
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
