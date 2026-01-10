<template>
  <v-btn
    class="google-btn"
    variant="outlined"
    rounded
    block
    :loading="loading"
    @click="signInWithGoogle"
  >
    <v-icon start color="#DB4437"> mdi-google </v-icon>
    {{ buttonText }}
  </v-btn>
</template>

<script>
export default {
  name: 'GoogleSignInButton',
  props: {
    buttonText: {
      type: String,
      default: 'Continue with Google',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'google-sign-in-start',
    'google-sign-in-success',
    'google-sign-in-error',
  ],
  methods: {
    async signInWithGoogle() {
      try {
        this.$emit('google-sign-in-start')
        await this.$store.dispatch('signInWithGoogle', {
          rememberMe: this.rememberMe,
        })
        this.$emit('google-sign-in-success')
      } catch (error) {
        console.error('Google authentication failed:', error)
        this.$emit('google-sign-in-error', error)
      }
    },
  },
}
</script>

<style scoped>
.google-btn {
  margin-top: 4px;
  border: 1px solid #dadce0;
  color: #3c4043;
  font-weight: 500;
}
</style>
