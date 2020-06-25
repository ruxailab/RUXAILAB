<template>
  <v-card shaped class="card" @click="toGo(item.path)">
    <v-container>
      <v-row justify="center" align="center">
        <v-col cols="12">
          <v-img contain :src="require('../../assets/manager/' + item.url)"></v-img>
        </v-col>
      </v-row>
    </v-container>
    <v-img src="../../assets/manager/bottomRectangle.svg" class="rectangle">
      <v-row justify="center" align="center">
        <div class="text">{{item.title}}</div>
      </v-row>
    </v-img>
  </v-card>
</template>

<script>
export default {
  props: ["item"],
  data: () => ({}),
  methods:{
    toGo(path){
      this.$router.push(path);
    }
  }
};
</script>

<style scoped>
.card {
  position: relative;
  overflow: hidden;
  width: 250px;
  height: 200px;
  margin: 20px;
  border-radius: 29px;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
.rectangle {
  position: absolute;
  bottom: 0%;
  left: 0%;
  right: 0%;
  height: 30px;
}
.text {
  font-family: Roboto;
  font-size: 20px;
  color: white;
}
</style>