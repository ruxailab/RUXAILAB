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
                {{ $t('FORGOT_PASSWORD.reset_password') }}
              </div>

              <div class="divider" />

              <v-form
                ref="form"
                v-model="valid"
                class="mx-3"
              >
                <v-text-field
                  v-model="email"
                  :label="$t('FORGOT_PASSWORD.email')"
                  :rules="emailRules"
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                  density="compact"
                  required
                />

                <p class="text-caption ml-2 mb-4">
                  {{ $t('FORGOT_PASSWORD.instructions') }}
                </p>
              </v-form>

              <v-card-actions class="justify-center mt-4">
                <v-btn
                  color="#F9A826"
                  rounded
                  class="text-white"
                  :loading="loading"
                  @click="onResetRequest()"
                >
                  {{ $t('FORGOT_PASSWORD.reset_button') }}
                </v-btn>
              </v-card-actions>

              <v-card-actions class="justify-center mt-1">
                <p>
                  <a
                    style="color: #F9A826; text-decoration: underline;"
                    @click="redirectToSignin"
                  >
                    {{ $t('FORGOT_PASSWORD.back_to_signin') }}
                  </a>
                </p>
              </v-card-actions>
            </v-col>
            <!--Image section-->
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar'
import i18n from '@/i18n'

export default {
  components: {
    Snackbar,
  },
  data: () => ({
    valid: false,
    email: '',
    emailRules: [
      (v) => !!v || i18n.t('errors.emailIsRequired'),
      (v) => /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || i18n.t('errors.invalidEmail'),
    ],
  }),
  computed: {
    loading() {
      return this.$store.getters.loading
    },
  },
  methods: {
    async onResetRequest() {
      if (!this.$refs.form.validate()) {
        return
      }

      try {
        await this.$store.dispatch('resetPassword', { email: this.email })
      } catch (error) {
        console.error('Password reset error:', error)
      }
    },
    redirectToSignin() {
      this.$router.push('/signin')
    },
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
</style>