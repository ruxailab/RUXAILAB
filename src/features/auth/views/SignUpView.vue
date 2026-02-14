<template>
  <div class="signup-wrapper">
    <Loading />
    <div class="logo-side d-none d-md-flex align-center justify-center">
      <img src="@/assets/logo_full.png" alt="RUXAILAB" class="logo-img" />
    </div>

    <!-- RIGHT: FORM -->
    <div class="form-side d-flex align-center justify-center">
      <Snackbar />

      <div class="signup-box">
        <h1 class="text-h6">
          {{ $t('auth.SIGNIN.sign-up') }}
        </h1>
        <p class="subtitle">
          {{ $t('auth.SIGNIN.signupSubtitle') }}
        </p>

        <v-form ref="form" v-model="valid" @submit.prevent="onSignUp">
          <v-text-field
            v-model="email"
            :rules="emailRules"
            :label="$t('auth.SIGNIN.email')"
            type="email"
            placeholder="you@example.com"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
          />

          <v-text-field
            v-model="password"
            :rules="passwordRules"
            :label="$t('auth.SIGNIN.password')"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            class="mb-2"
            @click:append-inner="showPassword = !showPassword"
          />

          <PasswordStrength :password="password" />

          <v-text-field
            v-model="confirmpassword"
            :rules="comparePassword"
            :label="$t('auth.SIGNIN.confirmPassword')"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="••••••••"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />

          <v-btn type="submit" color="primary" block min-height="44">
            {{ $t('auth.SIGNIN.sign-up') }}
          </v-btn>
        </v-form>

        <v-divider class="my-4">
          <span class="text-body-2 text-medium-emphasis">{{
            $t('auth.SIGNIN.or')
          }}</span>
        </v-divider>

        <GoogleSignInButton
          :button-text="$t('auth.SIGNIN.continueWithGoogle')"
          :loading="loading && loadingType === 'google'"
          :disabled="loadingType === 'signin'"
          @google-sign-in-start="onGoogleSignInStart"
          @google-sign-in-success="onGoogleSignInSuccess"
          @google-sign-in-error="onGoogleSignInError"
        />

        <div class="text-center mt-4">
          <span class="text-body-2 text-medium-emphasis">
            {{ $t('auth.SIGNIN.alreadyHaveAnAccount') }}
          </span>
          <v-btn
            variant="text"
            color="primary"
            class="text-body-2 pl-1"
            @click="redirectToSignin"
          >
            {{ $t('auth.SIGNIN.sign-in') }}
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
import Snackbar from '@/shared/components/Snackbar'
import Loading from '../../../shared/components/Loading.vue'
import GoogleSignInButton from '@/features/auth/components/GoogleSignInButton'
import { createEmailRules } from '@/shared/utils/validators'
import PasswordStrength from '@/features/auth/components/PasswordStrength.vue'

const email = ref('')
const password = ref('')
const confirmpassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const valid = ref(true)
const form = ref(null)
const loadingType = ref('')

const loading = computed(() => store.getters.loading)

const store = useStore()
const router = useRouter()
const { t } = useI18n()

const emailRules = createEmailRules(t)

const passwordRules = [
  (v) => !!v || t('errors.passwordRequired'),
  (v) => v?.length >= 8 || t('errors.passwordValidate'),
  (v) => /[A-Z]/.test(v) || t('errors.passwordUppercase'),
  (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || t('errors.passwordSymbol'),
]

const comparePassword = [
  (v) => !!v || t('errors.passwordRequired'),
  (v) => v === password.value || t('errors.differentPasswords'),
]

const onSignUp = async () => {
  const { valid } = await form.value.validate()
  if (valid) {
    try {
      loadingType.value = 'signin'
      store.commit('setLoading', true)
      await store.dispatch('signup', {
        email: email.value,
        password: password.value,
      })
      await router.push('/admin')
    } catch (error) {
      return error
    } finally {
      store.commit('setLoading', false)
    }
  }
}

const redirectToSignin = () => {
  router.push('/signin')
}

const onGoogleSignInStart = () => {
  loadingType.value = 'google'
  store.commit('setLoading', true)
}

const onGoogleSignInSuccess = async () => {
  await router.push('/admin')
  store.commit('setLoading', false)
}
const onGoogleSignInError = (error) => {
  store.commit('setLoading', false)
  return error
}
</script>

<style scoped>
.signup-wrapper {
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

.signup-box {
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

/* RESPONSIVE STYLES */
@media (max-width: 960px) {
  .logo-side {
    display: none;
  }

  .form-side {
    width: 100%;
    padding: 24px;
  }

  .signup-box {
    padding: 24px;
  }
}

@media (max-width: 600px) {
  .signup-box {
    padding: 16px;
    border-radius: 12px;
  }

  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
}
</style>
