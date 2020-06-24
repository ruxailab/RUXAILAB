<template>
  <v-row class="fill-height background" justify="center" align="center" dense>
    <v-card shaped class="card">
      <v-row class="header" align="start">
        <v-card-title>
          <v-breadcrumbs dark style="position:absolute; top:0%;" :items="items" large></v-breadcrumbs>
        </v-card-title>
      </v-row>
      <v-row>
        <router-view></router-view>
      </v-row>
    </v-card>
  </v-row>
</template>

<script>
export default {
  data: () => ({
    items: [
      {
        text: "Home",
        disabled: false,
        href: "/"
      },
      {
        text: "Manager",
        disabled: true,
        href: "/managerview/"
      },
      {
        text: "Link 1",
        disabled: true,
        href: "breadcrumbs_link_1"
      }
    ]
  }),
  created(){
    console.log(this.$route.params.pathMatch )
  }
};
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
  width: 80%;
  height: 90%;
  border-radius: 29px;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
  background: #c4c4c4;
}
.header {
  position: relative;
  height: 60px;

  background: #444444;
}

</style>