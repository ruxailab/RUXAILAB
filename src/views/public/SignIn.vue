<template>
  <div>
    <Snackbar/>
    <v-row align="center" justify="center">
      <v-col cols="6">
        <v-card :elevation="2">
          <v-card-title class="justify-center">
            <h3>{{$t('SIGNIN.sign-in')}}</h3>
          </v-card-title>
          <v-form class="mx-3" @keyup.native.enter="onSignIn()">
            <v-text-field :label="$t('SIGNIN.email')" prepend-inner-icon="mdi-account-circle" v-model="email"></v-text-field>

            <v-text-field
              :label="$t('SIGNIN.password')"
              prepend-inner-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
            ></v-text-field>
          </v-form>
          <v-card-actions class="justify-center">
            <v-btn 
            color="green lighten-1" 
            rounded class="white--text" 
            @click="onSignIn()"
            :loading="loading"
            >{{$t('SIGNIN.sign-in')}}</v-btn>
          </v-card-actions>
          <v-card-actions class="justify-center">
            <p>
              <a href="/signup">{{$t('SIGNIN.dont-have-account')}}</a>
            </p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Snackbar from '@/components/atoms/Snackbar'

export default {
    data: () => ({
        showPassword: false,
        email: '',
        password: ''
    }),
    methods: {
        async onSignIn() {
            await this.$store.dispatch("signin", {
                email: this.email,
                password: this.password
            })
            if(this.user) {
              this.$router.push('/');
            }
        }
    },
    computed: {
      loading() {
        return this.$store.getters.loading;
      },
      user() {
        return this.$store.getters.user;
      }
    },
    components: {
      Snackbar
    }
}
</script>