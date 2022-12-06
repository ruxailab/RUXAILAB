<template>
  <div>
    <Snackbar />
    <Intro/>
    <About/>
    <Footer/>
  </div>
</template>

<script>
import Intro from "@/components/atoms/Introduction";
import About from "@/components/organisms/LandingAbout";
import Footer from "@/components/organisms/Footer";
import Snackbar from "@/components/atoms/Snackbar";
import Controller from "@/controllers/BaseController";

export default {
  data: () => ({}),
  components: {
    Intro,
    About,
    Footer,
    Snackbar
  },
  async created() {
    const res = await new Controller().read("users", "accessLevel", 1)
    console.log("LANDING RESPONSE ==>>", res)
  }
};
</script>
