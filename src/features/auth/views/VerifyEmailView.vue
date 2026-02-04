<template>
  <div class="verify-email-wrapper">
    <!-- LEFT: LOGO -->
    <div class="logo-side d-none d-md-flex align-center justify-center">
      <img src="@/assets/logo_full.png" alt="RUXAILAB" class="logo-img" />
    </div>

    <!-- RIGHT: VERIFICATION -->
    <div class="form-side d-flex align-center justify-center">
      <Snackbar />

      <div class="verify-box">
        <div class="text-center">
          <v-icon size="80" color="primary" class="mb-4">mdi-email-check-outline</v-icon>
          <h1 class="text-h5 mb-2">Verify Your Email</h1>
          <p class="subtitle">
            We've sent a verification link to your email
          </p>
        </div>

        <v-card class="bg-light-blue my-4 px-4 py-3" variant="flat">
          <div class="text-body-2" style="color: #1a1a1a;">
            <v-icon size="small" class="mr-2" style="color: #1a1a1a;">mdi-information-outline</v-icon>
            <span>
              Check your email (including spam folder) and click the verification link to confirm your email address.
            </span>
          </div>
        </v-card>

        <div class="text-center">
          <v-btn
            color="primary"
            block
            min-height="44"
            :loading="isChecking"
            @click="checkVerification"
            class="mb-3"
          >
            I have verified my email
          </v-btn>

          <div class="text-center mt-4">
            <span class="text-body-2 text-medium-emphasis">
              Didn't receive the email?
            </span>
            <v-btn
              variant="text"
              color="primary"
              class="text-body-2"
              :loading="isResending"
              @click="resendVerificationEmail"
            >
              Resend
            </v-btn>
          </div>
        </div>

        <v-divider class="my-4" />

        <div class="text-center">
          <p class="text-body-2 text-medium-emphasis mb-3">
            Need to use a different email?
          </p>
          <v-btn
            variant="tonal"
            color="secondary"
            size="small"
            @click="logout"
          >
            Sign in with different email
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import Snackbar from '@/shared/components/Snackbar'
import AuthController from '@/features/auth/controllers/AuthController'
import { auth } from '@/app/plugins/firebase'

const store = useStore()
const router = useRouter()
const route = useRoute()

const isChecking = ref(false)
const isResending = ref(false)
const email = ref('')
let verificationCheckInterval = null

const authController = new AuthController()

onMounted(() => {
  // Get email from route params or session storage
  email.value = route.params.email || sessionStorage.getItem('signupEmail') || 'your email'
  
  // Prevent back button navigation on verify-email page
  // Add entry to history to prevent going back without verification
  window.history.pushState(null, null, window.location.href)
  window.addEventListener('popstate', handlePopState)
  
  // Start checking for email verification every 2 seconds
  startAutoVerificationCheck()
})

onUnmounted(() => {
  // Clean up interval when component is destroyed
  if (verificationCheckInterval) {
    clearInterval(verificationCheckInterval)
  }
  
  // Remove popstate listener
  window.removeEventListener('popstate', handlePopState)
})

const handlePopState = () => {
  // Prevent going back by pushing state again
  window.history.pushState(null, null, window.location.href)
}

const startAutoVerificationCheck = () => {
  const MAX_ATTEMPTS = 30 // 30 attempts × 2 seconds = 60 seconds max
  let attemptCount = 0

  verificationCheckInterval = setInterval(async () => {
    attemptCount++

    // Safety: Stop polling after max attempts
    if (attemptCount > MAX_ATTEMPTS) {
      clearInterval(verificationCheckInterval)
      store.commit('SET_TOAST', {
        message: 'Email verification timed out. Please try again or contact support.',
        type: 'error',
      })
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      clearInterval(verificationCheckInterval)
      return
    }

    try {
      // Reload user data to check verification status
      await authController.reloadCurrentUser()

      // Check if email is verified
      if (currentUser.emailVerified) {
        clearInterval(verificationCheckInterval)

        store.commit('SET_TOAST', {
          message: 'Email verified successfully!',
          type: 'success',
        })

        // Redirect to dashboard after brief delay
        setTimeout(() => {
          sessionStorage.removeItem('signupEmail')
          router.push('/admin')
        }, 1500)
      }
    } catch (error) {
      // Log error but continue polling
      console.warn('Verification check failed:', error.message)
    }
  }, 2000)
}

const checkVerification = async () => {
  isChecking.value = true
  try {
    const currentUser = auth.currentUser
    if (currentUser) {
      await authController.reloadCurrentUser()
      
      if (currentUser.emailVerified) {
        clearInterval(verificationCheckInterval)
        store.commit('SET_TOAST', {
          message: 'Email verified successfully!',
          type: 'success',
        })
        setTimeout(() => {
          sessionStorage.removeItem('signupEmail')
          router.push('/admin')
        }, 1500)
      } else {
        store.commit('SET_TOAST', {
          message: 'Email not verified yet. Please check your inbox.',
          type: 'warning',
        })
      }
    }
  } finally {
    isChecking.value = false
  }
}

const resendVerificationEmail = async () => {
  isResending.value = true
  try {
    const currentUser = auth.currentUser
    if (currentUser) {
      await authController.sendVerificationEmail(currentUser)
      store.commit('SET_TOAST', {
        message: 'Verification email has been sent',
        type: 'success',
      })
    }
  } finally {
    isResending.value = false
  }
}

const logout = async () => {
  clearInterval(verificationCheckInterval)
  sessionStorage.removeItem('signupEmail')
  
  try {
    await store.dispatch('logout', { silent: true })
  } finally {
    router.push('/signin')
  }
}
</script>

<style scoped>
.verify-email-wrapper {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: #ffffff;
  flex-wrap: wrap;
}

.logo-side {
  width: 50%;
  min-height: 100%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  max-width: 600px;
  width: 100%;
}

.form-side {
  width: 50%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-box {
  width: 100%;
  max-width: 450px;
  padding: 30px 32px 32px 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.bg-light-blue {
  background-color: rgba(33, 150, 243, 0.1) !important;
  border-left: 4px solid #2196f3;
}

/* RESPONSIVE STYLES */
@media (max-width: 960px) {
  .logo-side {
    display: none;
  }

  .form-side {
    width: 100%;
    padding: 24px;
  }

  .verify-box {
    padding: 24px;
  }
}

@media (max-width: 600px) {
  .verify-box {
    padding: 16px;
    border-radius: 12px;
  }

  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
}
</style>
