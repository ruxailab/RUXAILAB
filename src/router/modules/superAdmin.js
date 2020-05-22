import SuperAdmin from "@/views/superAdmin/SuperAdmin.vue";

export default [
  {
    path: "/superadmin",
    name: "Super Admin",
    meta:{authorize:[0]},
    component: SuperAdmin,
  }
];
