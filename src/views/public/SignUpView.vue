<template>
  <div class="background-grey">
    <Snackbar />
    <v-row justify="center" style="height: 90%" align="center">
      <v-col cols="12" md="8">
        <v-card color="#f5f7ff" class="mx-2">
          <v-row>
            <v-col cols="12" md="5" align-self="center">
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
                  <a style="color: #F9A826" href="/signin">Already have an account? Sign in</a>
                </p>
              </v-card-actions>
            </v-col>

            <v-col cols="7" class="hidden-sm-and-down" align-self="center">
              <v-img src="@/assets/signUp.svg"></v-img>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Snackbar from "@/components/atoms/Snackbar";

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
    user() {
      return this.$store.getters.user;
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  methods: {
    async onSignUp() {
      if (this.valid)
        await this.$store.dispatch("signup", {
          email: this.email,
          password: this.password
        }).then(() => {
          this.$router.push('/testslist');
        });
      if (this.user) {
        this.$router.push("/");
      }
    }
  },
  components: {
    Snackbar
  }
};
</script>

<style scoped>
.background-grey {
  background-color: #e8eaf2;
  height: 100vh;
  align-content: center;
}
.card-title {
  font-family: Roboto;
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