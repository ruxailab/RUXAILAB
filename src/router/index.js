import Vue from "vue";
import VueRouter from "vue-router";
import Public from "@/router/modules/public.js"
import Admin from "@/router/modules/admin.js"
import SuperAdmin from "@/router/modules/superAdmin.js"
import {autoSignIn} from "@/router/tools.js"

Vue.use(VueRouter);

const routes = [
  ...Public,
  ...Admin,
  ...SuperAdmin
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const user = autoSignIn()
  console.log(user)
  next()
  to
  from
  
  
 
})

export default router;
