<template>
  <div class="background-grey">
    <Snackbar />
    <v-row justify="center" style="height: 90%" align="center">
      <v-col cols="12" md="8">
        <v-card color="#f5f7ff" class="mx-2">
          <v-row>
            <v-col cols="12" md="5" align-self="center">
              <div class="card-title">
                {{ $t('SIGNIN.sign-up') }}
              </div>

              <div class="divider" />

              <v-form
                v-model="valid"
                class="mx-3"
                @keyup.enter="onSignUp()"
              >
                <v-text-field
                  v-model="email"
                  dense
                  outlined
                  :label="$t('SIGNIN.email')"
                  :rules="emailRules"
                  prepend-inner-icon="mdi-account-circle"
                />

                <v-text-field
                  v-model="password"
                  dense
                  outlined
                  :label="$t('SIGNIN.password')"
                  prepend-inner-icon="mdi-lock"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="passwordRules"
                  @click:append="showPassword = !showPassword"
                />

                <v-text-field
                  v-model="confirmpassword"
                  dense
                  outlined
                  :label="$t('SIGNIN.confirmPassword')"
                  prepend-inner-icon="mdi-lock"
                  :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :rules="[comparePassword]"
                  @click:append="showConfirmPassword = !showConfirmPassword"
                />
              </v-form>
              
              <v-card-actions class="justify-center mt-4">
                <v-btn
                  color="#F9A826"
                  rounded
                  class="white--text"
                  :loading="loading"
                  @click="onSignUp()"
                >
                  Sign-up
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
                <p>
                  <a
                    style="color: #F9A826; text-decoration: underline;"
                    @click="redirectToSignin"
                    >{{ $t('SIGNIN.alreadyHaveAnAccount') }}</a
                  >
                </p>
              </v-card-actions>
            </v-col>

            <v-col cols="7" class="hidden-sm-and-down" align-self="center">
              <v-img src="@/assets/signUp.svg" />
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
    email: '',
    password: '',
    confirmpassword: '',
    showPassword: false,
    showConfirmPassword: false,
    valid: true,
  }),
  computed: {
    emailRules() {
      return [
        (v) => !!v || this.$t('errors.emailIsRequired'),
        (v) => /.+@.+\..+/.test(v) || this.$t('errors.invalidEmail'),
      ]
    },
    passwordRules() {
      return [
        (v) => !!v || this.$t('errors.passwordRequired'),
        (v) => v.length >= 8 || this.$t('errors.passwordValidate'),
        (v) => /[A-Z]/.test(v) || this.$t('errors.passwordUppercase'),
        (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || this.$t('errors.passwordSymbol'),
      ]
    },
    comparePassword() {
      return (v) => (v === this.password && v !== '') || this.$t('errors.differentPasswords')
    },
    user() {
      return this.$store.getters.user
    },
    loading() {
      return this.$store.getters.loading
    },
  },
  methods: {
    async onSignUp() {
      if (this.valid) {
        try {
          await this.$store.dispatch('signup', {
            email: this.email,
            password: this.password,
          })
          await this.$router.push('/')
        } catch (error) {
          console.error('Signup failed:', error)
          this.errorMessage = 'Signup failed. Please check your credentials.'
        }
      }
    },
    redirectToSignin() {
      this.$router.push('/signin')
    },
    onGoogleSignInStart() {
      // Event when Google sign-in starts
    },
    async onGoogleSignInSuccess() {
      // Event when Google sign-in is successful
      await this.$router.push('/')
    },
    onGoogleSignInError(error) {
      // Event when Google sign-in fails
      console.error('Google sign-in error:', error)
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
