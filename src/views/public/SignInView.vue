<template>
  <div class="signin-wrapper d-flex">
    <!-- IZQUIERDA: LOGO -->
    <div class="logo-side d-none d-md-flex align-center justify-center">
      <img src="@/assets/ruxailab.png" alt="RUXAILAB" class="logo-img" />
    </div>

    <!-- DERECHA: FORMULARIO -->
    <div class="form-side d-flex align-center justify-center">
      <Snackbar />

      <div class="signin-box">
        <h1 class="title">
          {{ $t('SIGNIN.sign-in-title') }}
        </h1>
        <p class="subtitle">
          {{ $t('SIGNIN.sign-in-subtitle') }}
        </p>

        <v-form ref="form" @submit.prevent="onSignIn">
          <v-text-field v-model="email" :rules="emailRules" :label="$t('SIGNIN.email')" type="email"
            placeholder="you@example.com" prepend-inner-icon="mdi-email-outline" variant="outlined" class="mb-4" />

          <v-text-field v-model.trim="password" :rules="[rules.required]" :label="$t('SIGNIN.password')"
            :type="showPassword ? 'text' : 'password'" placeholder="••••••••" prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" variant="outlined" class="mb-2"
            @click:append-inner="toggleShowPassword" />

          <div class="d-flex justify-space-between align-center mb-6">
            <v-checkbox v-model="rememberMe" :label="$t('SIGNIN.rememberMe')" hide-details density="compact" />

            <v-btn variant="text" color="primary" class="text-body-2" @click="redirectToForgotPassword">
              {{ $t('SIGNIN.forgot-password') }}
            </v-btn>
          </div>

          <v-btn type="submit" color="primary" block :loading="loading" min-height="44" data-testid="sign-in-button">
            {{ $t('SIGNIN.sign-in') }}
          </v-btn>
        </v-form>

        <v-divider class="my-6">
          <span class="text-body-2 text-medium-emphasis">
            {{ $t('SIGNIN.or') }}
          </span>
        </v-divider>

        <GoogleSignInButton :button-text="$t('SIGNIN.continueWithGoogle')" :loading="loading"
          @google-sign-in-start="onGoogleSignInStart" @google-sign-in-success="onGoogleSignInSuccess"
          @google-sign-in-error="onGoogleSignInError" />

        <div class="text-center mt-6">
          <span class="text-body-2 text-medium-emphasis">
            {{ $t('SIGNIN.dont-have-account') }}
          </span>
          <v-btn variant="text" color="primary" class="text-body-2 pl-1" @click="redirectToSignup">
            {{ $t('SIGNIN.sign-up') }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
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

const emailSchema = z.string().email({ message: t('errors.invalidEmail') })

const emailRules = [
  (v) => !!v || t('errors.emailIsRequired'),
  (v) => emailSchema.safeParse(v).success || t('errors.invalidEmail'),
]

const rules = {
  required: (v) => !!v || t('PROFILE.passwordRequired'),
}

const loading = computed(() => store.getters.loading)

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
        router.push('/testslist').catch(() => { })
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

const onGoogleSignInStart = () => { }
const onGoogleSignInSuccess = async () => {
  if (store.getters.user) {
    router.push('/testslist').catch(() => { })
  }
}
const onGoogleSignInError = (error) => {
  console.error('Google sign-in error:', error)
}
</script>

<style scoped>
.signin-wrapper {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
  flex-direction: row;
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
  max-width: 400px;
  width: 100%;
}

.form-side {
  width: 50%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signin-box {
  width: 100%;
  max-width: 500px;
  padding: 48px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
  border: 10px solid rgba(0, 0, 0, 0.1);

}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 2rem;
}
</style>
