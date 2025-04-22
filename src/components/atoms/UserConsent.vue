<template>
  <v-container>
    <v-row justify="center">
      <v-col>
        <v-textarea
          v-model="consent"
          rows="3"
          variant="outlined"
          color="orange"
          class="mx-6 mt-3"
          placeholder="Consent Form..."
          @change="saveState()"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { VueEditor } from "vue2-editor";
export default {
  data: () => ({
    consent: '',
  }),
  components: {
    VueEditor
  },
  computed: {
    consentStore() {
      return this.$store.getters.consent
    },
    test() {
      return this.$store.getters.test
    },
  },
  mounted() {
    this.getConsent()
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
  watch: {
    consent() {
      this.saveState()
    }
  }
}
</script>

<style scoped>
.v-text-field--outlined>>>fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>
