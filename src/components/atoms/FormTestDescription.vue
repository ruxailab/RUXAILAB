<template>
  <v-form ref="form">
    <v-row>
      <v-col cols="12">
        <v-row justify="space-around">
          <v-col cols="5">
            <v-text-field
              v-model="test.title"
              label="Title"
              :rules="titleRequired"
              counter="100"
              outlined
              @input="$emit('change')"
              dense
            ></v-text-field>
            <v-select
              :disabled="lock"
              :items="types"
              v-model="test.type"
              label="Type"
              :rules="typeRequired"
              dense
              outlined
            
            ></v-select>
          </v-col>
          <v-col cols="5">
            <v-textarea
              v-model="test.description"
              label="Description"
              outlined
              dense
              @input="$emit('change')"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: ["test","lock"],
  data: () => ({
    titleRequired: [
      v => !!v || "Field Required",
      v => v.length <= 100 || "Max 100 characters"
    ],
    typeRequired: [
      v => !!v || "Field Required"
    ],
    types: [{text: "Usability User Test", value: "User"}, {text: "Usability Heuristic Evaluation", value: "Expert"}]
  }),
  methods: {
    valida() {
      let valid = this.$refs.form.validate();
      this.$emit("valForm", valid, 0);
      return valid;
    },
    resetVal() {
      this.$refs.form.resetValidation();
    }
  }
};
</script>

<style>
</style>