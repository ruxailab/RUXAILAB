<template>
<v-hover v-slot:default="{ hover }">
  <v-card :elevation="hover ? 24 : 10"  shaped class="card" @click="createTest()">
    <v-card-text>
      <v-row class="fill-height" justify="center" align="center">
        <v-icon color="#f9a826" size="150">mdi-plus-circle-outline</v-icon>
      </v-row>
      <v-row class="fill-height" justify="center" align="center">
        <p>New Test</p>
      </v-row>
    </v-card-text>
  </v-card>
</v-hover>
</template>

<script>
export default {
  methods: {
    createTest() {
      this.$router.push("/createtest");
    }
  }
};
</script>

<style>
.card {
  max-width: 330px;
  height: 200px;
  border-radius: 3px;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
  background-color: #fff;
  border-bottom: 2px solid transparent;
  margin: 0 16px 16px 0;
}
.icon {
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
</style>