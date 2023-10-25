<template>
  <v-form ref="form">
    <v-row class="mt-4" justify="center">
      <v-col cols="10">
        <v-text-field v-model="object.preTest.consentUrl" prepend-inner-icon="mdi-link-variant" label="Consent"
                      :rules="googleLinkRules" outlined dense
        />
        <v-text-field v-model="object.preTest.preTestUrl" prepend-inner-icon="mdi-link-variant" label="Pre Form"
                      :rules="googleLinkRules" outlined dense
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: {
    object: {
      type: Object,
      default: () => { },
    },
  },
  data: () => ({
    googleLinkRules: [
      (v) =>
        v == null ||
        v == '' ||
        v.indexOf('https://docs.google.com/forms/') == 0 ||
        v.indexOf('docs.google.com/forms/') == 0 ||
        'Google forms link required',
    ],
  }),
  watch: {
    object: {
      deep: true,
      handler() {
        const isValueValid = this.$refs.form.validate()
        if (isValueValid) {
          this.$emit('input', this.object.preTest)
        }
      },
    },
  },
}
</script>
