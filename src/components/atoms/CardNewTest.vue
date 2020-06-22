<template>
<v-hover v-slot:default="{ hover }">
  <v-card :elevation="hover ? 24 : 10"  shaped class="card" @click="createTest()">
    <v-card-text class="fill-height">
      <v-row class="fill-height" justify="center" align="center">
        <v-icon color="#f9a826" size="170">mdi-plus-circle-outline</v-icon>
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
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 250px;
  border-radius: 29px;
  z-index: 2;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
.icon {
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
</style>