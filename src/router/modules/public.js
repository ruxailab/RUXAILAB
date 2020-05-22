import TestView from "@/views/public/TestView.vue";
import TasksView from "@/views/public/TasksView.vue";
import SignIn from "@/views/public/SignIn.vue";
import SignUp from "@/views/public/SignUp.vue";
import Home from "@/views/public/Home.vue";

export default [
  {
    path: "/testview/:id",
    name: "TestView",
    props: true,
    meta:{authorize:[]},
    component: TestView,
  },
  {
    path: "/testview/:id/:type",
    name: "TasksView",
    props: true,
    meta:{authorize:[]},
    component: TasksView,
  },
  {
    path: "/signin",
    name: "Sign In",
    meta:{authorize:[]},
    component: SignIn,
  },
  {
    path: "/signup",
    name: "Sign Up",
    meta:{authorize:[]},
    component: SignUp,
  },
  {
    path: "/home",
    name: "Home",
    meta:{authorize:[]},
    component: Home
  }
];
