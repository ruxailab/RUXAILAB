import Vue from "vue";
import VueRouter from "vue-router";
import Public from "@/router/modules/public.js"
import Admin from "@/router/modules/admin.js"
import SuperAdmin from "@/router/modules/superAdmin.js"
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

export default router;
