<template>
  <v-card color="#f5f7ff">
    <v-row class="ma-0 pa-0">
      <v-col cols="12" align-self="center">
        <div class="card-title">Sign-Up</div>

        <div class="divider"></div>

        <v-form class="mx-3" v-model="valid" @keyup.native.enter="onSignUp()">
          <v-text-field
            dense
            outlined
            label="E-mail"
            :rules="emailRules"
            prepend-inner-icon="mdi-account-circle"
            v-model="email"
          ></v-text-field>

          <v-text-field
            dense
            outlined
            label="Password"
            prepend-inner-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            :type="showPassword ? 'text' : 'password'"
            :rules="passwordRules"
            v-model="password"
          ></v-text-field>

          <v-text-field
            dense
            outlined
            label="Confirm Password"
            prepend-inner-icon="mdi-lock"
            :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showConfirmPassword = !showConfirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmpassword"
            :rules="[comparePassword]"
          ></v-text-field>
        </v-form>
        <v-card-actions class="justify-center mt-4">
          <v-btn
            color="#F9A826"
            rounded
            class="white--text"
            @click="onSignUp()"
            :loading="loading"
          >Sign-up</v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-1">
          <p>
            <a style="color: #F9A826" @click="$emit('change')">Already have an account? Sign in</a>
          </p>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    valid: true,
    email: "",
    emailRules: [
      v => !!v || "Email is required",
      v => /.+@.+\..+/.test(v) || "Invalid email"
    ],
    password: "",
    passwordRules: [
      v => !!v || "Password is required",
      v => v.length >= 6 || "Password must be at least 6 characters"
    ],
    confirmpassword: "",
    showPassword: false,
    showConfirmPassword: false
  }),
  computed: {
    comparePassword() {
      return () =>
        (this.confirmpassword == this.password && this.confirmpassword != "") ||
        "Different passwords";
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  methods: {
    async onSignUp() {
      if (this.valid)
        await this.$store
          .dispatch("signup", {
            email: this.email,
            password: this.password
          })
          .then(() => {
            this.$emit("logined");
          });
    }
  }
};
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