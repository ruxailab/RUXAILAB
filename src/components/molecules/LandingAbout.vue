<template>
  <div>
    <v-container fluid class="background-blob">
      <AboutTop />
      
      <AboutBottom />
    </v-container>

    <Footer />
  </div>
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
import Footer from "@/components/atoms/Footer";

export default {
  data: () => ({}),
  components: {
    AboutTop,
    AboutBottom,
    Footer
  }
};
</script>