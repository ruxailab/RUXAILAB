<template>
  <v-form ref="form">
    <v-row class="mt-4" justify="center">
      <v-col cols="10">
        <v-card-text>
          <v-text-field
            v-model="Object.consent"
            prepend-inner-icon="mdi-link-variant"
            :label="$t('inputs.consent')"
            :rules="googleLinkRules"
            outlined
            dense
            @input="$emit('change')"
          />
          <v-text-field
            v-model="Object.preForm"
            prepend-inner-icon="mdi-link-variant"
            :label="$t('inputs.form')"
            :rules="googleLinkRules"
            outlined
            dense
            @input="$emit('change')"
          />
        </v-card-text>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    Object:{
      consent: '',
      preForm: ''
    },
    googleLinkRules: [
      (v) =>
        v == null ||
        v == '' ||
        v.indexOf('https://docs.google.com/forms/') == 0 ||
        v.indexOf('docs.google.com/forms/') == 0 ||
        'Google forms link required',
    ],
    valids: [true, true],
  }),
  watch: {
    'preTest.consent'() {
      const valid = this.$refs.form.validate()
      this.$emit('valForm', valid, this.valIndex)
    },
    'preTest.form'() {
      const valid = this.$refs.form.validate()
      this.$emit('valForm', valid, this.valIndex)
    },
  },
}
</script>
