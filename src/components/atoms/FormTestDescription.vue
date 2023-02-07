<template>
  <v-form ref="form">
    <v-row justify="space-around" class="pa-2">
      <v-col cols="12" md="5">
        <v-text-field
          :autofocus="lock ? false : true"
          v-model="test.testDescription"
          label="Title"
          :rules="titleRequired"
          counter="100"
          outlined
          @input="$store.commit('SET_LOCAL_CHANGES',true)"
          dense
        ></v-text-field>
        <v-select
          :disabled="lock"
          :items="types"
          v-model="test.testType"
          label="Type"
          :rules="typeRequired"
          dense
          outlined
        ></v-select>
      </v-col>
      <v-col cols="12" md="5">
        <v-textarea
          v-model="test.testDescription"
          label="Description"
          outlined
          dense
          @input="$store.commit('SET_LOCAL_CHANGES',true)"
        ></v-textarea>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: {
    test: {
      type: Object,
      required: true,
    },
    lock: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    titleRequired: [
      (v) => !!v || "Field Required",
      (v) => v.length <= 100 || "Max 100 characters",
    ],
    typeRequired: [(v) => !!v || "Field Required"],
    types: [
      { text: "Usability User Test", value: "User" },
      { text: "Usability Heuristic Evaluation", value: "HEURISTICS" },
    ],
  }),
  methods: {
    valida() {
      let valid = this.$refs.form.validate();
      this.$emit("valForm", valid, 0);
      return valid;
    },
    resetVal() {
      this.$refs.form.resetValidation(); //used on emits
    },
  },
};
</script>

<style>
</style>