import SuperAdmin from '@/shared/views/superAdmin/SuperAdminView.vue'

export default [
  {
    path: '/superadmin',
    name: 'Super Admin',
    meta: { authorize: [0] },
    component: SuperAdmin,
  },
]
