<template>
  <div class="signup-wrapper d-flex">
    <!-- LEFT: LOGO -->
    <div class="logo-side d-none d-md-flex align-center justify-center">
      <img
        src="@/assets/ruxailab.png"
        alt="RUXAILAB"
        class="logo-img"
      >
    </div>

    <!-- RIGHT: FORM -->
    <div class="form-side d-flex align-center justify-center">
      <Snackbar />

      <div class="signup-box">
        <h1 class="text-h6">
          {{ $t('SIGNIN.sign-up') }}
        </h1>
        <p class="subtitle">
          {{ $t('SIGNIN.signupSubtitle') }}
        </p>

        <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="onSignUp"
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
            v-model="password"
            :rules="passwordRules"
            :label="$t('SIGNIN.password')"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            class="mb-4"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-text-field
            v-model="confirmpassword"
            :rules="comparePassword"
            :label="$t('SIGNIN.confirmPassword')"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="••••••••"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            class="mb-4"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading"
            min-height="44"
          >
            {{ $t('SIGNIN.sign-up') }}
          </v-btn>
        </v-form>

        <v-divider class="my-6">
          <span class="text-body-2 text-medium-emphasis">{{ $t('SIGNIN.or') }}</span>
        </v-divider>

        <GoogleSignInButton
          :button-text="$t('SIGNIN.continueWithGoogle')"
          :loading="loading"
          @google-sign-in-start="onGoogleSignInStart"
          @google-sign-in-success="onGoogleSignInSuccess"
          @google-sign-in-error="onGoogleSignInError"
        />

        <div class="text-center mt-6">
          <span class="text-body-2 text-medium-emphasis">
            {{ $t('SIGNIN.alreadyHaveAnAccount') }}
          </span>
          <v-btn
            variant="text"
            color="primary"
            class="text-body-2 pl-1"
            @click="redirectToSignin"
          >
            {{ $t('SIGNIN.sign-in') }}
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
import Snackbar from '@/components/atoms/Snackbar'
import GoogleSignInButton from '@/features/auth/components/GoogleSignInButton'
import { z } from 'zod'

const email = ref('')
const password = ref('')
const confirmpassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const valid = ref(true)
const form = ref(null)

const store = useStore()
const router = useRouter()
const { t } = useI18n()

const signupSchema = z.object({
  email: z.string().email(t('errors.invalidEmail')),
  password: z.string()
    .min(8, t('errors.passwordValidate'))
    .regex(/[A-Z]/, t('errors.passwordUppercase'))
    .regex(/[!@#$%^&*(),.?":{}|<>]/, t('errors.passwordSymbol')),
  confirmpassword: z.string(),
}).refine(data => data.password === data.confirmpassword, {
  message: t('errors.differentPasswords'),
  path: ['confirmpassword'],
})

const emailRules = [
  v => !!v || t('errors.emailIsRequired'),
  v => signupSchema.shape.email.safeParse(v).success || t('errors.invalidEmail'),
]

const passwordRules = [
  v => !!v || t('errors.passwordRequired'),
  v => signupSchema.shape.password.safeParse(v).success || t('errors.passwordValidate'),
]

const comparePassword = [
  v => !!v || t('errors.passwordRequired'),
  v => v === password.value || t('errors.differentPasswords')
]

const user = computed(() => store.getters.user)
const loading = computed(() => store.getters.loading)

const onSignUp = async () => {
  const parsed = signupSchema.safeParse({
    email: email.value,
    password: password.value,
    confirmpassword: confirmpassword.value,
  })

  if (!parsed.success) {
    console.error('Validation failed:', parsed.error.flatten())
    return
  }

  const { valid: isValid } = await form.value.validate()
  if (isValid) {
    try {
      await store.dispatch('signup', {
        email: email.value,
        password: password.value,
      })
      await router.push('/testslist')
    } catch (error) {
      console.error('Signup failed:', error)
    }
  }
}

const redirectToSignin = () => {
  router.push('/signin')
}

const onGoogleSignInStart = () => {
  // Optional: Show loader or feedback
}

const onGoogleSignInSuccess = async () => {
  await router.push('/testslist')
}
const onGoogleSignInError = (error) => {
  console.error('Google sign-in error:', error)
}
</script>

<style scoped>
.signup-wrapper {
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

.signup-box {
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