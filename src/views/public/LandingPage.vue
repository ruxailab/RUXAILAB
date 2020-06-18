<template>
  <div>
    <Intro />

    <About />

    <Footer />
  </div>
</template>

<script>
import Intro from "@/components/atoms/Introduction";
import About from "@/components/molecules/LandingAbout";
import Footer from "@/components/atoms/Footer";

export default {
  data: () => ({}),
  components: {
    Intro,
    About,
    Footer
  }
};
</script>

