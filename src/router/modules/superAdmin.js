const SuperAdmin = () =>
  import(
    /* webpackChunkName: "super-admin" */ '@/features/super/SuperAdminView.vue'
  )

export default [
  {
    path: '/superadmin',
    name: 'Super Admin',
    meta: { authorize: [0] },
    component: SuperAdmin,
  },
]
