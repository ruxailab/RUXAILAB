<template>
  <v-form ref="form">
    <v-row>
      <v-col cols="12">
        <v-row justify="space-around">
          <v-col cols="5">
            <v-text-field v-model="test.title" label="Title" :rules="requiredRule" counter="100" outlined dense></v-text-field>
            <v-overflow-btn
              :items="types"
              v-model="test.type"
              label="Type"
              :rules="requiredRule"
              dense
              outlined
            ></v-overflow-btn>
          </v-col>
          <v-col cols="5">
            <v-textarea v-model="test.description" label="Description" outlined dense></v-textarea>
          </v-col>
        </v-row>
        <v-card-text></v-card-text>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: ["test"],
  data: () => ({
    requiredRule: [
      v => !!v || "Field Required",
      v => v.length <= 100 || "Max 100 characters"
    ],
    types: ["User", "Expert"]
  }),
  methods: {
    valida() {
      let valid = this.$refs.form.validate();
      this.$emit("valForm", valid, 0);
    }
  }
};
</script>

<style>
</style>