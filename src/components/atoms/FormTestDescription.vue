<template>
  <v-form>
    <v-row>
      <v-col cols="12">
        <v-card-text>
          <v-text-field v-model="test.title" label="Title" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="test.type" label="Type"></v-text-field>
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
    requiredRule: [v => !!v || "Field Required"]
  })
};
</script>

<style>
</style>