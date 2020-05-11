<template>
  <v-form>
    <v-row>
      <v-col cols="12">
        <v-card-text>
          <v-text-field v-model="test.title" label="Title" :rules="requiredRule"></v-text-field>
          <v-overflow-btn
            :items="types"
            v-model="test.type"
            label="Type"
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
    types:['User','Expert']
  })
};
</script>

<style>
</style>