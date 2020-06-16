<template>
  <v-container fluid class="background-blob">
    <AboutTop />

    <AboutBottom />
  </v-container>
</template>

<style scoped>
.background-blob {
  background-image: url("https://i.ibb.co/C7F8Vmq/blob.png");
  background-size: contain;
  background-position: center;
}
</style>

<script>
import AboutTop from "@/components/atoms/AboutTop";
import AboutBottom from "@/components/atoms/AboutBottom";

export default {
  data: () => ({}),
  components: {
    AboutTop,
    AboutBottom
  }
};
</script>