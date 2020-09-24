<template>
  <v-form ref="form" v-if="preTest">
    <v-row>
      <v-col>
        <v-card-text>
          <v-text-field
            prepend-inner-icon="mdi-link-variant"
            label="Consent"
            v-model="preTest.consent"
            :rules="googleLinkRules"
            @input="$emit('change')"
            outlined
            dense
          ></v-text-field>
          <v-text-field
            prepend-inner-icon="mdi-link-variant"
            label="Form"
            v-model="preTest.form"
            :rules="googleLinkRules"
            @input="$emit('change')"
            outlined
            dense
          ></v-text-field>
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
      required: true
    },
    valIndex: {
      type: Number,
      required: true 
    }
  },
  data: () => ({
    googleLinkRules: [
      v =>
        v == null ||
        v == "" ||
        v.indexOf("https://docs.google.com/forms/") == 0 ||
        v.indexOf("docs.google.com/forms/") == 0 ||
        "Google forms link required"
    ],
    valids: [true, true]
  }),
  watch: {
    "preTest.consent"() {
      let valid = this.$refs.form.validate();
      this.$emit("valForm", valid, this.valIndex);
    },
    "preTest.form"() {
      let valid = this.$refs.form.validate();
      this.$emit("valForm", valid, this.valIndex);
    }
  }
};
</script>

<style>
</style>