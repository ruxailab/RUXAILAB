<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="8">
        <v-textarea
          filled
          v-model="consent"
          name="input-7-4"
          label="Consent"
          placeholder="You agree to the following terms and conditions..."
          rows="3"
          @change="saveState()"
        ></v-textarea>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    consent: '',
  }),
  mounted() {
    this.getConsent()
  },
  computed: {
    consentStore() {
      return this.$store.getters.consent
    },
    test() {
      return this.$store.getters.test
    },
  },
  methods: {
    saveState() {
      this.$store.dispatch('setConsent', this.consent)
      this.test.testStructure.consent = this.consent
    },
    getConsent() {
      if(this.test.testStructure.consent) {
        this.consent = this.test.testStructure.consent
      }
    },
  },
}
</script>

<style>
</style>
