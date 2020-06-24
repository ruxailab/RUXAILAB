<template>
  <v-container style="display:contents">
    <v-row class="fill-height background" align="center">
      <v-col>
        <v-row justify="center">
          <v-card shaped class="card">
            <v-row class="header">
              <v-card-title>Haaaaaa</v-card-title>
            </v-row>
            <v-row>
              <v-col>
                <router-view></router-view>
              </v-col>
            </v-row>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped>
.background {
  position: absolute;
  background: url(../../assets/BackgroundShape.png),
    url(../../assets/BackgroundShapeBottom.png), #dfdfdf;
  background-position: -525px -450px, 0px 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
.card {
  position: relative;
  overflow: hidden;
  width: 900px;
  height: 500px;
  margin: 20px;
  border-radius: 29px;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
  background: #c4c4c4;
}
.header {
  position: relative;
  left: 0%;
  right: 0%;
  top: 0%;
  bottom: 90%;

  background: #444444;
}
</style>