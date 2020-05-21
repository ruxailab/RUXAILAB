import SuperAdmin from "@/views/SuperAdmin.vue";

export default [
  {
    path: "/superadmin",
    name: "Super Admin",
    meta:{authorize:[0]},
    component: SuperAdmin,
  }
];
