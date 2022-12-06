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
import TestController from "../../controllers/TestController";

export default {
  data: () => ({}),
  components: {
    Intro,
    About,
    Footer,
    Snackbar
  },

  async created() {
    console.log("TESTEEEEE")
    await new TestController().createNewTest().then((res)=> {console.log(res)})
  },
};
</script>
