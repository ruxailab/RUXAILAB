<template>
  <v-form>
    <v-row justify="space-around">
      <v-col cols="5">
        <v-text-field label="Name" v-model="task.name" :rules="requiredRule"></v-text-field>
        <v-textarea label="Description" v-model="task.description"></v-textarea>
      </v-col>
      <v-col cols="5">
        <v-text-field label="Tip" v-model="task.tip"></v-text-field>
        <v-text-field label="Post-test" v-model="task.postTest"></v-text-field>
        <v-row align="center" cols="2">
          <v-col>Timer:</v-col>
          <v-col>
            <v-switch v-model="task.timer"></v-switch>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: ["task"],
  data() {
    return {
      requiredRule: [v => !!v || "Field Required"]
    };
  }
};
</script>

<style>
</style>