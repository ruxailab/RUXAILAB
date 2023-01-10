<template>
    <div>
        <Snackbar />
        <Intro />
        <About />
        <Footer />
    </div>
</template>

<script>
import Intro from "@/components/atoms/Introduction";
import About from "@/components/organisms/LandingAbout";
import Footer from "@/components/organisms/Footer";
import Snackbar from "@/components/atoms/Snackbar";
// import UserController from "../../controllers/UserController";

export default {
<<<<<<< HEAD
  data: () => ({}),
  components: {
    Intro,
    About,
    Footer,
    Snackbar,
  
  },

  // async created(){
  //   console.log("LANDING PAGE RESPONSE")
  //   await new UserController().getObjectUser("email","tales.furlan@gmail.com")
  //   //await new UserController().getAllObjectUser()
  // }

}
=======
    data: () => ({}),
    components: {
        Intro,
        About,
        Footer,
        Snackbar,
    },
>>>>>>> c1de5b2bfdc6cb2f39692e90853fdabedcc4061a

    async created() {
        console.log("LANDING PAGE RESPONSE");
        await new UserController().getObjectUser(
            "email",
            "tales.furlan@gmail.com"
        );
        //await new UserController().getAllObjectUser()
    },
};
</script>
