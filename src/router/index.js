import Vue from "vue";
import VueRouter from "vue-router";
import Public from "@/router/modules/public.js";
import Admin from "@/router/modules/admin.js";
import SuperAdmin from "@/router/modules/superAdmin.js";
import { autoSignIn, redirect } from "@/router/tools.js";
import store from "@/store/index.js";

Vue.use(VueRouter);

const routes = [...Public, ...Admin, ...SuperAdmin];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeResolve(async (to, from, next) => {
  const { authorize } = to.meta;
  const signIn = autoSignIn();

  
  if (authorize.length > 0 && to.path !== "/signin") {
    await signIn;
 
    const user = store.state.auth.user;

    if (!user) {
      return next(redirect());
    }
    if (!authorize.includes(user.accessLevel)) {
      return next(redirect());
    }
    next();
  }
  next();
});

export default router;
