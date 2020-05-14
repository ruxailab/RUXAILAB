<template>
  <v-form ref="form">
    <v-row>
      <v-col cols="12">
        <v-card-text>
          <v-text-field v-model="test.title" label="Title" :rules="requiredRule"></v-text-field>
          <v-overflow-btn
            :items="types"
            v-model="test.type"
            label="Type"
            :rules="requiredRule"
          ></v-overflow-btn>
          <v-textarea v-model="test.description" label="Description"></v-textarea>
        </v-card-text>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: ["test"],
  data: () => ({
    requiredRule: [v => !!v || "Field Required"],
    types:['User','Expert'],
  }),
  methods: {
    valida()
    {
      let valid = this.$refs.form.validate();
      console.log('valida 0 ' + valid);  
      this.$emit('valForm', valid, 0);
    }
  }
};
</script>

<style>
</style>