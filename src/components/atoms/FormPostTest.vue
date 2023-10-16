<template>
  <v-form ref="form">
    <v-row class="mt-4" justify="center">
      <v-col cols="10">
        <v-text-field
          v-model="object.postTestUrl"
          prepend-inner-icon="mdi-link-variant"
          label="Form"
          :rules="googleLinkRules"
          outlined
          dense
          @input="emitChange()"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    object: {
      postTestUrl: '',
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
    emitChange() {
      const isValueValid = this.$refs.form.validate()
      if (isValueValid) {
        this.$store.dispatch('setPostTest', this.object)
      }
    },
  },
  computed: {
    testStructure(){
      return this.$store.state.Tests.Test.testStructure
    }
  },
  mounted() {
    this.object.postTestUrl = this.testStructure.postTest.postTestUrl
  },
}
</script>
