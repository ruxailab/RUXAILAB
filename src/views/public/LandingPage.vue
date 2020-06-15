<template>
  <div>
    <Intro />

    <About />

    <v-card height="1000px" class="mt-5" color="blue"></v-card>
  </div>
</template>

<script>
import Intro from "@/components/atoms/Introduction";
import About from "@/components/atoms/LandingAbout"

export default {
  data: () => ({}),
  components: {
    Intro,
    About
  }
};
</script>

