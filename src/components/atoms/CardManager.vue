<template>
  <v-card shaped class="card">
    <v-container>
      <v-row justify="center" align="center">
          <v-col cols="12">
          <v-img contain :src="require('../../assets/' + imgName)">

          </v-img>
          </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
    props: ["imgName"],
    data: () => ({})
}
</script>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 250px;
  border-radius: 29px;
  z-index: 2;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
</style>