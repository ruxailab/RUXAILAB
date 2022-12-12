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
// import TestController from "../../controllers/TestController";
// import AuthController from "../../controllers/AuthController";

//test to createNewTest
// const docDataTest = {
//     stringExample: "Hello world!",
//     booleanExample: true,
//     numberExample: 3.14159265,
//     arrayExample: [5, true, "hello"],
//     nullExample: null,
//     objectExample: {
//         a: 5,
//         b: {
//             nested: "foo"
//         }
//     }
// };



export default {
  data: () => ({}),
  components: {
    Intro,
    About,
    Footer,
    Snackbar,
  
  },

  //teste dos controllers
  
  // async created() {
  //   console.log("TEST CONTROLLER")
  //   await new TestController().createNewTest("test", "TesteTata", docDataTest).then((res)=> {console.log(res)})
  //   console.log("GET ALL")
  //   await new TestController().getAllObjectTest('test').then((res)=> {console.log(res)})
  //   console.log("GET OBJECT")
  //   await new TestController().getObjectTest('test', "answers", "n0MWTYrj8BAqJJwNdfxl").then((res)=> {console.log(res)})
  //   console.log("AUTH TEST")
  //   await new AuthController().authGetCurrentUser().then((res)=> {console.log(res)})
  // },

};
</script>
