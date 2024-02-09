<template>
  <v-container>
    <v-row justify="center">
      <v-col>
        <v-textarea
          rows="3"
          outlined
          v-model="consent"
          color="orange"
          class="mx-6 mt-3"
          placeholder="Consent Form..."
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
      if (this.test.testStructure.consent) {
        this.consent = this.test.testStructure.consent
      }
    },
  },
}
</script>

<style scoped>
.v-text-field--outlined >>> fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>
