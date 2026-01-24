<template>
  <div class="signin-wrapper">
    <!-- LEFT: LOGO -->
    <div class="logo-side d-none d-md-flex align-center justify-center">
      <img src="@/assets/logo_full.png" alt="RUXAILAB" class="logo-img" />
    </div>

    <!-- RIGHT: FORM -->
    <div class="form-side d-flex align-center justify-center">
      <div class="signin-box">
        <h1 class="text-h6">
          {{ $t('auth.SIGNIN.sign-in-title') }}
        </h1>
        <p class="subtitle">
          {{ $t('auth.SIGNIN.sign-in-subtitle') }}
        </p>

        <v-form ref="form" @submit.prevent="onSignIn">
          <v-text-field
            v-model="email"
            :rules="emailRules"
            :label="$t('auth.SIGNIN.email')"
            type="email"
            placeholder="you@example.com"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            class="mb-4"
          />

          <v-text-field
            v-model.trim="password"
            :rules="[rules.required]"
            :label="$t('auth.SIGNIN.password')"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            class="mb-2"
            @click:append-inner="toggleShowPassword"
          />

          <div class="d-flex justify-space-between align-center mb-6 flex-wrap">
            <v-checkbox
              v-model="rememberMe"
              :label="$t('auth.SIGNIN.rememberMe')"
              hide-details
              density="compact"
            />

            <v-btn
              variant="text"
              color="primary"
              class="text-body-2 mt-2 mt-md-0"
              @click="redirectToForgotPassword"
            >
              {{ $t('auth.SIGNIN.forgot-password') }}
            </v-btn>
          </div>

          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading && loadingType === 'signin'"
            :disabled="loadingType === 'google'"
            min-height="44"
            data-testid="sign-in-button"
          >
            {{ $t('auth.SIGNIN.sign-in') }}
          </v-btn>
        </v-form>

        <v-divider class="my-6">
          <span class="text-body-2 text-medium-emphasis">
            {{ $t('auth.SIGNIN.or') }}
          </span>
        </v-divider>

        <GoogleSignInButton
          :remember-me="rememberMe"
          :button-text="$t('auth.SIGNIN.continueWithGoogle')"
          :loading="loading && loadingType === 'google'"
          :disabled="loadingType === 'signin'"
          @google-sign-in-start="onGoogleSignInStart"
          @google-sign-in-success="onGoogleSignInSuccess"
          @google-sign-in-error="onGoogleSignInError"
        />

        <div class="text-center mt-6">
          <span class="text-body-2 text-medium-emphasis">
            {{ $t('auth.SIGNIN.dont-have-account') }}
          </span>
          <v-btn
            variant="text"
            color="primary"
            class="text-body-2 pl-1"
            @click="redirectToSignup"
          >
            {{ $t('auth.SIGNIN.sign-up') }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import GoogleSignInButton from '@/features/auth/components/GoogleSignInButton'
import { createEmailRules } from '@/shared/utils/validators'

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const form = ref(null)
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loadingType = ref('')

const loading = computed(() => store.getters.loading)

const emailRules = createEmailRules(t)

const rules = {
  required: (v) => !!v || t('errors.passwordRequired'),
}

const onSignIn = async () => {
  if (!form.value) return

  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    store.commit('setLoading', true)
    loadingType.value = 'signin'
    await store.dispatch('signin', {
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
    })
    await router.push('/admin')
  } catch (error) {
    return error
  } finally {
    loadingType.value = ''
    store.commit('setLoading', false)
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
  loadingType.value = 'google'
  store.commit('setLoading', true)
}

const onGoogleSignInSuccess = async () => {
  if (store.getters.user) router.push('/admin')
  store.commit('setLoading', false)
}

const onGoogleSignInError = (error) => {
  loadingType.value = ''
  store.dispatch('setLoading', false)
  return error
}
</script>

<style scoped>
.signin-wrapper {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: #ffffff;
  flex-wrap: wrap;
}

/* LEFT SIDE LOGO */
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

/* RIGHT SIDE FORM */
.form-side {
  width: 50%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* BOX STYLING */
.signin-box {
  width: 100%;
  max-width: 450px;
  padding: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
}

/* TITLE & SUBTITLE */
.subtitle {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1.5rem;
}

/* RESPONSIVE ADJUSTMENTS */
@media (max-width: 960px) {
  .logo-side {
    display: none; /* hide logo on smaller screens */
  }

  .form-side {
    width: 100%;
    padding: 24px;
  }

  .signin-box {
    padding: 24px;
  }
}

@media (max-width: 600px) {
  .signin-box {
    padding: 16px;
    border-radius: 12px;
  }

  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
}
</style>
