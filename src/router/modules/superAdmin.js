import SuperAdmin from '@/features/super/SuperAdminView.vue'

export default [
  {
    path: '/superadmin',
    name: 'Super Admin',
    meta: { authorize: [-1] },
    component: SuperAdmin,
  },
]