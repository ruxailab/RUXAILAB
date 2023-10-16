<template>
  <v-form ref="form">
    <v-row class="mt-4" justify="center">
      <v-col cols="10">
        <v-card-text>
          <v-text-field
            v-model="object.consentUrl"
            prepend-inner-icon="mdi-link-variant"
            label="Consent"
            :rules="googleLinkRules"
            outlined
            dense
            @input="emitConsentChange()"
          />
          <v-text-field
            v-model="object.preFormUrl"
            prepend-inner-icon="mdi-link-variant"
            label="Pre Form"
            :rules="googleLinkRules"
            outlined
            dense
            @input="emitPreFormChange()"
          />
        </v-card-text>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    object: {
      consentUrl: '',
      preFormUrl: '',
    },
    googleLinkRules: [
      (v) =>
        v == null ||
        v == '' ||
        v.indexOf('https://docs.google.com/forms/') == 0 ||
        v.indexOf('docs.google.com/forms/') == 0 ||
        'Google forms link required',
    ],
  }),
  methods: {
    emitConsentChange() {
      const isValueValid = this.$refs.form.validate()

      if (isValueValid) {
        this.$store.dispatch('setPreTest', this.object)
      }
    },
    emitPreFormChange() {
      const isValueValid = this.$refs.form.validate()

      if (isValueValid) {
        this.$store.dispatch('setPreTest', this.object)
      }
    },
  },
  computed: {
    testStructure(){
      return this.$store.state.Tests.Test.testStructure
    }
  },
  created() {
    this.object.consentUrl = this.testStructure.preTest.consentUrl
    this.object.preFormUrl = this.testStructure.preTest.preFormUrl
  },
}
</script>
