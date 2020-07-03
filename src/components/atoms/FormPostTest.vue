<template>
  <v-form ref="form">
    <v-row>
      <v-col>
        <v-text-field
          prepend-inner-icon="mdi-link-variant"
          label="Form"
          v-model="postTest"
          :rules="googleLinkRules"
          outlined
          dense
        ></v-text-field>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: ["postTest"],
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
    valida() {
      let valid = this.$refs.form.validate();
      this.$emit("valForm", valid, 2);
    }
  }
};
</script>

<style>
</style>