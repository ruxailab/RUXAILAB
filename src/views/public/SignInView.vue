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
          rounded="xl"
          flat
        >
          <v-row>
            <v-col
              cols="10"
              md="5"
              align-self="center"
              class="ma-8"
            >
              <div class="card-title">
                {{ $t('SIGNIN.sign-in') }}
              </div>

              <div class="divider" />

              <v-form
                ref="form"
                class="mx-3"
                @keyup.enter="onSignIn()"
              >
                <v-text-field
                  v-model="email"
                  :label="$t('SIGNIN.email')"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-circle"
                  density="compact"
                  :rules="emailRules"
                />

                <v-text-field
                  v-model.trim="password"
                  :label="$t('SIGNIN.password')"
                  prepend-inner-icon="mdi-lock"
                  variant="outlined"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  density="compact"
                  :rules="[rules.required]"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-form>
              
              <v-card-actions class="justify-center mt-4">
                <v-btn
                  data-testid="sign-in-button"
                  rounded
                  class="text-white"
                  style="background-color: #F9A826;"
                  :loading="loading"
                  @click="onSignIn()"
                >
                  {{ $t('SIGNIN.sign-in') }}
                </v-btn>
              </v-card-actions>
              
              <div class="text-center my-3">
                <span class="or-divider">{{ $t('SIGNIN.or') }}</span>
              </div>
              
              <div class="mx-3">
                <google-sign-in-button 
                  :button-text="$t('SIGNIN.continueWithGoogle')"
                  :loading="loading"
                  @google-sign-in-start="onGoogleSignInStart"
                  @google-sign-in-success="onGoogleSignInSuccess"
                  @google-sign-in-error="onGoogleSignInError"
                />
              </div>
              
              <v-card-actions class="justify-center mt-1">
                <p style="margin-right: 10px;">
                  <a
                    style="color: #F9A826 ;text-decoration: underline; cursor: pointer;"
                    @click="redirectToSignup"
                  >
                    {{ $t('SIGNIN.dont-have-account') }}
                  </a>
                </p>
                <p>
                  <a
                    style="color: #F9A826; text-decoration: underline;"
                    @click="redirectToForgotPassword"
                  >
                    {{ $t('SIGNIN.forgot-password') }}
                  </a>
                </p>
              </v-card-actions>
            </v-col>

            <v-col
              cols="6"
              class="d-none d-sm-flex"
              align-self="center"
            >
              <v-img :src="require('@/assets/signIn.svg')" />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar'
import GoogleSignInButton from '@/components/atoms/GoogleSignInButton'
import i18n from '@/i18n'
export default {
  components: {
    Snackbar,
    GoogleSignInButton
  },
  data: () => ({
    showPassword: false,
    email: '',
    password: '',
    emailRules: [
      (v) => !!v || i18n.global.t('errors.emailIsRequired'),
      (v) => /.+@.+\..+/.test(v) || i18n.global.t('errors.invalidEmail'),
    ],
    rules: {
      required: (value) => !!value || i18n.global.t('PROFILE.passwordRequired'),
    },
  }),
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    user() {
      return this.$store.getters.user
    },
  },
  methods: {
    checkForm() {
      return this.$refs.form.validate()
    },
    async onSignIn() {
      const result = this.checkForm()
      if (result) {
        try {
          await this.$store.dispatch('signin', {
            email: this.email,
            password: this.password,
          })
          if (this.$store.getters.user) {
            this.$router.push('/testslist').catch(() => {})
          }
        } catch (error) {
          console.error('Erro de autenticação:', error)
        }
      }
    },
    redirectToSignup() {
      this.$router.push('/signup')
    },
    onGoogleSignInStart() {
      // Event when Google sign-in starts
    },
    async onGoogleSignInSuccess() {
      // Event when Google sign-in is successful
      if (this.$store.getters.user) {
        this.$router.push('/testslist').catch(() => {})
      }
    },
    onGoogleSignInError(error) {
      // Event when Google sign-in fails
      console.error('Google sign-in error:', error)
      },
    redirectToForgotPassword() {
      this.$router.push('/forgot-password')
    }
  },
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
.or-divider {
  position: relative;
  color: #757575;
  font-size: 14px;
}
.or-divider::before,
.or-divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background-color: #c4c4c4;
}
.or-divider::before {
  left: 0;
  margin-left: 16px;
}
.or-divider::after {
  right: 0;
  margin-right: 16px;
}
</style>