<template>
  <div class="background-grey">
    <Snackbar />

    <v-row
      justify="center"
      align="center"
      style="height: 100%;"
    >
      <v-col
        cols="12"
        md="6"
        lg="5"
      >
        <v-card
          class="mx-auto pa-6"
          max-width="480"
          elevation="8"
        >
          <v-card-title class="text-h4 font-weight-bold mb-2">
            {{ $t('SIGNIN.sign-up') }}
          </v-card-title>

          <v-card-subtitle class="mb-6">
            {{ $t('SIGNIN.signupSubtitle') }}
          </v-card-subtitle>

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
              :rules="[comparePassword]"
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

          <v-btn
            variant="outlined"
            block
            :loading="isLoading"
            min-height="44"
            @click="onGoogleSignInStart"
          >
            <v-icon
              start
              icon="mdi-google"
            />
            Google
          </v-btn>

          <div class="text-center mt-6">
            <span class="text-body-2 text-medium-emphasis">
              {{ $t('SIGNIN.alreadyHaveAnAccount') }}
            </span>
            <v-btn
              variant="text"
              color="primary"
              class="text-body- pl-1"
              @click="redirectToSignin"
            >
              {{ $t('SIGNIN.sign-in') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Snackbar from '@/components/atoms/Snackbar'

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

const emailRules = computed(() => [
  v => !!v || t('errors.emailIsRequired'),
  v => /.+@.+\..+/.test(v) || t('errors.invalidEmail'),
])

const passwordRules = computed(() => [
  v => !!v || t('errors.passwordRequired'),
  v => v.length >= 8 || t('errors.passwordValidate'),
  v => /[A-Z]/.test(v) || t('errors.passwordUppercase'),
  v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || t('errors.passwordSymbol'),
])

const comparePassword = computed(() =>
  v => (v === password.value && v !== '') || t('errors.differentPasswords')
)

const user = computed(() => store.getters.user)
const loading = computed(() => store.getters.loading)

const onSignUp = async () => {
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
.background-grey {
  background-color: #e8eaf2;
  height: 100vh;
  display: flex;
  align-items: center;
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