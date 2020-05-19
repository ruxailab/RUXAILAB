<template>
  <div>
    <v-row align="center" justify="center">
      <v-col cols="6">
        <v-card :elevation="2">
          <v-card-title class="justify-center">
            <h3>Sign-Up</h3>
          </v-card-title>
          <v-form class="mx-3" v-model="valid">
            <v-text-field
              label="E-mail"
              :rules="emailRules"
              prepend-inner-icon="mdi-account-circle"
              v-model="email"
            ></v-text-field>

            <v-text-field
              label="Password"
              prepend-inner-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              :type="showPassword ? 'text' : 'password'"
              :rules="passwordRules"
              v-model="password"
            ></v-text-field>

            <v-text-field
              label="Confirm Password"
              prepend-inner-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              :type="showPassword ? 'text' : 'password'"
              v-model="confirmpassword"
              :rules="[comparePassword]"
            ></v-text-field>
          </v-form>
          <v-card-actions class="justify-center">
            <v-btn color="green lighten-1" rounded class="white--text" @click="onSignUp">Sign-Up</v-btn>
          </v-card-actions>
          <v-card-actions class="justify-center">
            <p>
              <a href="/signin">Have an account yet? Sign ip</a>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => ({
    valid: true,
    email: "",
    emailRules: [
      v => !!v || "Mandatory email",
      v => /.+@.+\..+/.test(v) || "Invalid email"
    ],
    password: "",
    passwordRules: [
      v => !!v || "Mandatory password",
      v => v.length >= 6 || "Password must be at least 6 characters"
    ],
    confirmpassword: "",
    showPassword: false
  }),
  computed: {
    comparePassword() {
      return () =>
        (this.confirmpassword == this.password && this.confirmpassword != "") ||
        "Different passwords";
    },
    user() {
      return this.$store.getters.user;
    }
  },
  methods: {
    async onSignUp() {
      if (this.valid)
        await this.$store.dispatch("signup", {
          email: this.email,
          password: this.password
        });
    }
  }
};
</script>