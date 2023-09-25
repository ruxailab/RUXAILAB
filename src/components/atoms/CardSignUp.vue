<template>
  <v-card color="#f5f7ff">
    <v-row class="ma-0 pa-0">
      <v-col cols="12" align-self="center">
        <div class="card-title">
          {{ $t('SIGNIN.sign-up') }}
        </div>

        <div class="divider" />

        <v-form v-model="valid" class="mx-3" @keyup.native.enter="onSignUp()">
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
            {{ $t('SIGNIN.sign-up') }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-1">
          <p>
            <a style="color: #F9A826" @click="$emit('change')" />
          </p>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import i18n from '@/i18n'
export default {
  data: () => ({
    valid: true,
    email: '',
    emailRules: [
      (v) => !!v || i18n.t('errors.emailIsRequired'),
      (v) => /.+@.+\..+/.test(v) || i18n.t('errors.invalidEmail'),
    ],
    password: '',
    passwordRules: [
      (v) => !!v || i18n.t('errors.passwordRequired'),
      (v) => v.length >= 6 || i18n.t('errors.passwordValidate'),
    ],
    confirmpassword: '',
    showPassword: false,
    showConfirmPassword: false,
  }),
  computed: {
    comparePassword() {
      return () =>
        (this.confirmpassword === this.password && this.confirmpassword !== '') ||
        i18n.t('errors.differentPasswords')
    },
    loading() {
      return this.$store.getters.loading
    },
  },
  methods: {
    async onSignUp() {
      if (this.valid)
        await this.$store
          .dispatch('signup', {
            email: this.email,
            password: this.password,
          })
          .then(() => {
            this.$emit('logined')
          })
    },
  },
}
</script>

<style scoped>
.card-title {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 48px;
  line-height: 56px;
  margin-left: 12px;
  margin-bottom: 20px;
}
</style>