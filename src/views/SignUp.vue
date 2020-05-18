<template>
  <div>
    <v-row align="center" justify="center">
      <v-col cols="6">
        <v-card :elevation="2">
          <v-card-title class="justify-center">
            <h3>Sign-Up</h3>
          </v-card-title>
          <v-form class="mx-3">
            <v-text-field label="E-mail" prepend-inner-icon="mdi-account-circle" v-model="email"></v-text-field>

            <v-text-field
              label="Password"
              prepend-inner-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
            ></v-text-field>
          </v-form>
          <v-card-actions class="justify-center">
            <v-btn color="green lighten-1" rounded class="white--text" @click="onSignUp()">Sign-Up</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => ({
    email: "",
    password: "",
    showPassword: false
  }),
  computed: {
      user(){
          return this.$store.getters.user
      }
  },
  methods: {
      async onSignUp(){
          await this.$store.dispatch("signup",{
              email: this.email,
              password: this.password
          })
      }
  },
};
</script>