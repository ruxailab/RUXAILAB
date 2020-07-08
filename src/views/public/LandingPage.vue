<template>
  <div>
    <Intro/>
    <About/>
    <Footer/>
  </div>
</template>

<script>
import Intro from "@/components/atoms/Introduction";
import About from "@/components/organisms/LandingAbout";
import Footer from "@/components/organisms/Footer";

export default {
  data: () => ({}),
  components: {
    Intro,
    About,
    Footer
  }
};
</script>
