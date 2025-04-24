<template>
  <div class="background-grey">
    <Snackbar />
    <v-row
      justify="center"
      style="height: 90%"
      align="center"
    >
      <v-col
        cols="12"
        md="8"
      >
        <v-card
          color="#f5f7ff"
          class="mx-2"
        >
          <v-row>
            <v-col
              cols="12"
              md="5"
              align-self="center"
            >
              <div class="card-title">
                {{ $t('SIGNIN.sign-up') }}
              </div>

              <div class="divider" />

              <v-form
                ref="form"
                v-model="valid"
                class="mx-3"
                @keyup.enter="onSignUp"
              >
                <v-text-field
                  v-model="email"
                  density="compact"
                  variant="outlined"
                  :label="$t('SIGNIN.email')"
                  :rules="emailRules"
                  prepend-inner-icon="mdi-account-circle"
                />

                <v-text-field
                  v-model="password"
                  density="compact"
                  variant="outlined"
                  :label="$t('SIGNIN.password')"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="passwordRules"
                  @click:append-inner="showPassword = !showPassword"
                />

                <v-text-field
                  v-model="confirmpassword"
                  density="compact"
                  variant="outlined"
                  :label="$t('SIGNIN.confirmPassword')"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :rules="[comparePassword]"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />
              </v-form>
              <v-card-actions class="justify-center mt-4">
                <v-btn
                  rounded
                  class="text-white"
                  style="background-color: #F9A826;"
                  :loading="loading"
                  @click="onSignUp"
                >
                  Sign-up
                </v-btn>
              </v-card-actions>
              <v-card-actions class="justify-center mt-1">
                <p>
                  <a
                    style="color: #F9A826; text-decoration: underline; cursor: pointer;"
                    @click="redirectToSignin"
                  >{{ $t('SIGNIN.alreadyHaveAnAccount') }}</a>
                </p>
              </v-card-actions>
            </v-col>

            <v-col
              cols="7"
              class="d-none d-sm-flex"
              align-self="center"
            >
              <v-img :src="require('@/assets/signUp.svg')" />
            </v-col>
          </v-row>
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
const { t: i18n } = useI18n()

const emailRules = computed(() => [
  v => !!v || i18n('errors.emailIsRequired'),
  v => /.+@.+\..+/.test(v) || i18n('errors.invalidEmail'),
])

const passwordRules = computed(() => [
  v => !!v || i18n('errors.passwordRequired'),
  v => v.length >= 8 || i18n('errors.passwordValidate'),
  v => /[A-Z]/.test(v) || i18n('errors.passwordUppercase'),
  v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || i18n('errors.passwordSymbol'),
])

const comparePassword = computed(() => 
  v => (v === password.value && v !== '') || i18n('errors.differentPasswords')
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
      await router.push('/')
    } catch (error) {
      console.error('Signup failed:', error)
    }
  }
}

const redirectToSignin = () => {
  router.push('/signin')
}

const onGoogleSignInStart = () => {
  // Event when Google sign-in starts
}

const onGoogleSignInSuccess = async () => {
  // Event when Google sign-in is successful
  await router.push('/')
}

const onGoogleSignInError = (error) => {
  // Event when Google sign-in fails
  console.error('Google sign-in error:', error)
}
</script>

<style scoped>
.background-grey {
  background-color: #e8eaf2;
  height: 100vh;
  align-content: center;
}
.card-title {
  font-style: normal;
  font-weight: 300;
  font-size: 48px;
  line-height: 56px;
  margin-left: 12px;
  margin-bottom: 20px;
}
.divider {
  margin-bottom: 40px;
  margin-left: 8px;
  background: linear-gradient(
    90deg,
    #c4c4c4,
    rgba(196, 196, 196, 0)
  ) !important;
  height: 0.5px;
}
</style>