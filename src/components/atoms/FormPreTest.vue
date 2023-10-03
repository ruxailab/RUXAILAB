<template>
  <v-form v-if="preTest" ref="form">
    <v-row>
      <v-col>
        <v-card-text>
          <v-text-field
            v-model="preTest.consent"
            prepend-inner-icon="mdi-link-variant"
            :label="$t('inputs.consent')"
            :rules="googleLinkRules"
            outlined
            dense
            @input="$emit('change')"
          />
          <v-text-field
            v-model="preTest.form"
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
  props: {
    preTest: {
      type: Object,
      required: true,
    },
    valIndex: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    googleLinkRules: [
      (v) =>
        v == null ||
        v == '' ||
        v.indexOf('https://docs.google.com/forms/d/e/1FAIpQLSfEyOVr9Mf8pk9waTY4xtkr_o_iWUoQUvWTTkhXiFT2iS5B4A/viewform') == 0 ||
        // v.indexOf("docs.google.com/forms/") == 0 ||
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