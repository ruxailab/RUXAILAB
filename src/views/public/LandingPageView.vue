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
// import AuthController from "../../controllers/AuthController";
// import Controller from "@/controllers/BaseController";


export default {
  data: () => ({}),
  components: {
    Intro,
    About,
    Footer,
    Snackbar,
  
  },

  //tests of controllers
  
  async created() {
  // console.log("USER CONTROLLER")
  // await new UserController().getAllObjectUser().then((res)=> {console.log(res)})
    console.log("GET ALL")
    await new TestController().getAllObjectTest().then((res)=> {console.log(res)})
    console.log("GET OBJECT")
    await new TestController().getObjectTest("answers", "n0MWTYrj8BAqJJwNdfxl").then((res)=> {console.log(res)})
  //   console.log("AUTH TEST")
  //   await new AuthController().authGetCurrentUser().then((res)=> {console.log(res)})
  //   const res = await new Controller().read("users", "email", "tamiris.tavares1801@gmail.com")
  //   console.log("LANDING RESPONSE ==>>", res)
 },
}

</script>
