import TestView from "@/views/TestView.vue";
import TasksView from "@/views/TasksView.vue";
import SignIn from "@/views/SignIn.vue";
import SignUp from "@/views/SignUp.vue";

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
];
