<template>
  <v-container style="display:contents">
    <v-row class="fill-height background">
      <v-col>
        <v-card shaped class="card">
          <v-card-title>Haaaaaa</v-card-title>
        </v-card>
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
    url(../../assets/BackgroundShapeBottom.png);
  background-position: -525px -450px, 0px 0px;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>