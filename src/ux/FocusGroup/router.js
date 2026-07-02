import ManagerView from '@/ux/FocusGroup/views/ManagerView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'

export default [
  {
    path: '/focusGroup/dashboard/:id',
    alias: '/focusGroup/manager/:id',
    name: 'FocusGroupManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: '/focusGroup/settings/:id',
        name: 'FocusGroupSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/focusGroup/cooperators/:id',
        name: 'FocusGroupCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
    ],
  },
]
