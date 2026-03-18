import SuperAdmin from '@/features/super/SuperAdminView.vue'

export default [
  {
    path: '/superadmin',
    name: 'SuperAdmin',
    meta: { authorize: [0, 4] },
    component: SuperAdmin,
  },
]
