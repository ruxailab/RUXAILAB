<template>
  <v-form ref="form">
    <v-row class="mt-4" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="Object.postTest"
          prepend-inner-icon="mdi-link-variant"
          label="Form"
          :rules="googleLinkRules"
          outlined
          dense
          @input="$emit('change')"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    Object: {
      postTest: ''
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
  watch: {
    'postTest.form'() {
      const valid = this.$refs.form.validate()
      this.$emit('valForm', valid, this.valIndex)
    },
  },
}
</script>
