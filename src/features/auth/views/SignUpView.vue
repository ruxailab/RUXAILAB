<template>
  <AuthLayout show-mobile-logo>
    <template #prepend>
      <Loading />
    </template>
    <template #form-prepend>
      <Snackbar />
    </template>

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
        persistent-placeholder
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        class="mb-3"
      />

      <v-text-field
        v-model="password"
        :rules="passwordRules"
        :label="$t('auth.SIGNIN.password')"
        :type="showPassword ? 'text' : 'password'"
        placeholder="••••••••"
        persistent-placeholder
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        variant="outlined"
        class="mb-3"
        @click:append-inner="showPassword = !showPassword"
      />

      <PasswordStrength :password="password" />

      <v-text-field
        v-model="confirmpassword"
        :rules="comparePassword"
        :label="$t('auth.SIGNIN.confirmPassword')"
        :type="showConfirmPassword ? 'text' : 'password'"
        placeholder="••••••••"
        persistent-placeholder
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
        variant="outlined"
        class="mb-3"
        @click:append-inner="showConfirmPassword = !showConfirmPassword"
      />

      <v-btn
        type="submit"
        color="primary"
        block
        min-height="44"
      >
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
  </AuthLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Snackbar from '@/shared/components/Snackbar'
import Loading from '../../../shared/components/Loading.vue'
import GoogleSignInButton from '@/features/auth/components/GoogleSignInButton'
import AuthLayout from '@/features/auth/components/AuthLayout.vue'
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
      await router.push('/verify-email')
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

<style scoped></style>
