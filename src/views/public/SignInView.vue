<template>
  <div class="background-grey d-flex align-center justify-center">
    <Snackbar />

    <v-card
      class="mx-auto pa-6"
      max-width="480"
      elevation="8"
    >
      <v-card-title class="text-h4 font-weight-bold mb-2">
        {{ $t('SIGNIN.sign-in-title') }}
      </v-card-title>

      <v-card-subtitle class="mb-6">
        {{ $t('SIGNIN.sign-in-subtitle') }}
      </v-card-subtitle>

      <v-form
        ref="form"
        @submit.prevent="onSignIn"
      >
        <v-text-field
          v-model="email"
          :rules="emailRules"
          :label="$t('SIGNIN.email')"
          type="email"
          placeholder="you@example.com"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          class="mb-4"
        />

        <v-text-field
          v-model.trim="password"
          :rules="[rules.required]"
          :label="$t('SIGNIN.password')"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          variant="outlined"
          class="mb-2"
          @click:append-inner="toggleShowPassword"
        />

        <div class="d-flex justify-space-between align-center mb-6">
          <v-checkbox
            v-model="rememberMe"
            :label="$t('SIGNIN.rememberMe')"
            hide-details
            density="compact"
          />

          <v-btn
            variant="text"
            color="primary"
            class="text-body-2"
            @click="redirectToForgotPassword"
          >
            {{ $t('SIGNIN.forgot-password') }}
          </v-btn>
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          :loading="loading"
          min-height="44"
          data-testid="sign-in-button"
        >
          {{ $t('SIGNIN.sign-in') }}
        </v-btn>
      </v-form>

      <v-divider class="my-6">
        <span class="text-body-2 text-medium-emphasis">
          {{ $t('SIGNIN.or') }}
        </span>
      </v-divider>

      <div class="mb-6">
        <GoogleSignInButton
          :button-text="$t('SIGNIN.continueWithGoogle')"
          :loading="loading"
          @google-sign-in-start="onGoogleSignInStart"
          @google-sign-in-success="onGoogleSignInSuccess"
          @google-sign-in-error="onGoogleSignInError"
        />
      </div>

      <div class="text-center mt-6">
        <span class="text-body-2 text-medium-emphasis">
          {{ $t('SIGNIN.dont-have-account') }}
        </span>
        <v-btn
          variant="text"
          color="primary"
          class="text-body-2 pl-1"
          @click="redirectToSignup"
        >
          {{ $t('SIGNIN.sign-up') }}
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Snackbar from '@/components/atoms/Snackbar'
import GoogleSignInButton from '@/components/atoms/GoogleSignInButton'

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const form = ref(null)
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const emailRules = [
  (v) => !!v || t('errors.emailIsRequired'),
  (v) => /.+@.+\..+/.test(v) || t('errors.invalidEmail'),
]

const rules = {
  required: (v) => !!v || t('PROFILE.passwordRequired'),
}

const loading = computed(() => store.getters.loading)
const user = computed(() => store.getters.user)

const checkForm = () => form.value?.validate()

const onSignIn = async () => {
  const isValid = await checkForm()
  if (isValid) {
    try {
      await store.dispatch('signin', {
        email: email.value,
        password: password.value,
      })
      if (store.getters.user) {
        router.push('/testslist').catch(() => {})
      }
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }
}

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

const redirectToSignup = () => {
  router.push('/signup')
}

const redirectToForgotPassword = () => {
  router.push('/forgot-password')
}

const onGoogleSignInStart = () => {
  // Optional hook for when Google sign-in begins
}

const onGoogleSignInSuccess = async () => {
  if (store.getters.user) {
    router.push('/testslist').catch(() => {})
  }
}

const onGoogleSignInError = (error) => {
  console.error('Google sign-in error:', error)
}
</script>

<style scoped>
.background-grey {
  background-color: #e8eaf2;
  height: 100vh;
}

.v-card {
  border-radius: 16px !important;
}

:deep(.v-field) {
  border-radius: 12px !important;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}
</style>