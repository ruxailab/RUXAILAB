<template>
  <div>
    <Intro />

    <About />

  </div>
</template>

<script>
import Intro from "@/components/atoms/Introduction";
import About from "@/components/molecules/LandingAbout"

export default {
  data: () => ({}),
  components: {
    Intro,
    About
  }
};
</script>

