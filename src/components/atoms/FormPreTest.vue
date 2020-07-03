<template>
<v-form ref="form">
  <v-row>
    <v-col>
      <v-card-text>
        <v-text-field
          prepend-inner-icon="mdi-link-variant"
          label="Consent"
          v-model="preTest.consent"
          :rules="googleLinkRules"
          outlined dense
        ></v-text-field>
        <v-text-field
          prepend-inner-icon="mdi-link-variant"
          label="Form"
          v-model="preTest.form"
          :rules="googleLinkRules"
          outlined dense
        ></v-text-field>
      </v-card-text>
    </v-col>
  </v-row>
  </v-form>
</template>

<script>
export default {
  props:['preTest'],
  data: () => ({
    googleLinkRules: [
      v =>
        v == null ||
        v == "" ||
        v.indexOf("https://docs.google.com/forms/") == 0 ||
        v.indexOf("docs.google.com/forms/") == 0 ||
        "Google forms link required" //link precisa ter "https://docs.google.com/forms/" no indice 0 ou nao é um link valido
    ]
  }),
  methods: {
    valida()
    {
      let valid = this.$refs.form.validate();
      this.$emit('valForm', valid, 1);
    }
  }
};
</script>

<style>
</style>