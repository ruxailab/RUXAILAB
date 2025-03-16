<template>
  <div :style="{ backgroundColor: backgroundColor }" class="background-grey">
    <Snackbar />
    <v-row justify="center" style="height: 90%" align="center">
      <v-col cols="12" md="8">
        <v-card :color="cardColor" rounded="xl" flat>
          <v-row>
            <v-col cols="10" md="5" align-self="center" class="ma-8">
              <div class="card-title">
                {{ $t('SIGNIN.sign-in') }}
              </div>

              <div class="divider" />

              <v-form class="mx-3" @keyup.native.enter="onSignIn()">
                <v-text-field
                  v-model="email"
                  :label="$t('SIGNIN.email')"
                  outlined
                  prepend-inner-icon="mdi-account-circle"
                  dense
                  class="input-field"
                />

                <v-text-field
                  v-model="password"
                  :label="$t('SIGNIN.password')"
                  prepend-inner-icon="mdi-lock"
                  outlined
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  dense
                  @click:append="showPassword = !showPassword"
                  class="input-field"
                />
              </v-form>

              <v-card-actions class="justify-center mt-4">
                <v-btn
                  data-testid="sign-in-button"
                  color="#F9A826"
                  rounded
                  class="white--text"
                  :loading="loading"
                  @click="onSignIn()"
                >
                  {{ $t('SIGNIN.sign-in') }}
                </v-btn>
              </v-card-actions>

              <v-card-actions class="justify-center mt-1">
                <p>
                  <a
                    style="color: #F9A826; text-decoration: underline;"
                    @click="redirectToSignup"
                  >
                    {{ $t('SIGNIN.dont-have-account') }}
                  </a>
                </p>
              </v-card-actions>
            </v-col>

            <v-col cols="6" class="hidden-sm-and-down" align-self="center">
              <v-img src="@/assets/signIn.svg" />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar'

export default {
  components: {
    Snackbar,
  },
  data: () => ({
    showPassword: false,
    email: '',
    password: '',
  }),
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    user() {
      return this.$store.getters.user
    },
    backgroundColor() {
      return this.$vuetify.theme.dark ? '#121212' : '#e8eaf2';
    },
    // Card color based on theme
    cardColor() {
      return this.$vuetify.theme.dark ? '#2C2C2C' : '#f5f7ff'; // Dark or Light card color
    }
  },
  methods: {
    async onSignIn() {
      try {
        await this.$store.dispatch('signin', {
          email: this.email,
          password: this.password,
        })
        if (this.$store.getters.user) {
          this.$router.push('/testslist').catch(() => {})
        }
      } catch (error) {
        console.error('Authentication Error:', error)
      }
    },
    redirectToSignup() {
      this.$router.push('/signup')
    },
  },
}
</script>

<style scoped>
.background-grey {
  height: 100vh;
  align-content: center;
  transition: background-color 0.3s ease;
}

/* Fallback styles for theme */
.theme--dark .background-grey {
  background-color: #121212 !important;
}
.theme--light .background-grey {
  background-color: #e8eaf2 !important;
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
  background: linear-gradient(90deg, #c4c4c4, rgba(196, 196, 196, 0)) !important;
  height: 0.5px;
}

/* Style for input fields */
.input-field .v-input__control {
  background-color: transparent !important;
  border: none !important;
}

.input-field .v-input__control input {
  background-color: transparent !important;
  color: inherit; /* Text color for inputs */
  box-shadow: none !important; /* Remove the box shadow */
}

.input-field .v-input__control label {
  color: inherit !important; /* Label color */
}

.input-field .v-input__control:focus-within {
  border: 1px solid #F9A826 !important; /* Focus border color */
}

/* For dark mode */
.theme--dark .input-field .v-input__control {
  background-color: rgba(255, 255, 255, 0.05) !important; /* Dark mode input background */
  border: 1px solid rgba(255, 255, 255, 0.2) !important; /* Dark mode input border */
}

/* For light mode */
.theme--light .input-field .v-input__control {
  background-color: rgba(0, 0, 0, 0.05) !important; /* Light mode input background */
  border: 1px solid rgba(0, 0, 0, 0.2) !important; /* Light mode input border */
}

/* Focused input */
.theme--dark .input-field .v-input__control:focus-within,
.theme--light .input-field .v-input__control:focus-within {
  border-color: #F9A826 !important;
}
</style>
