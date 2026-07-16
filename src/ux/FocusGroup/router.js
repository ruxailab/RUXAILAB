import ManagerView from '@/ux/FocusGroup/views/ManagerView.vue'
import EditFocusGroupView from '@/ux/FocusGroup/views/EditFocusGroupView.vue'
import FocusGroupSessionView from '@/ux/FocusGroup/views/FocusGroupSessionView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'

export default [
  {
    path: '/focusGroup/session/:id',
    name: 'FocusGroupSessionView',
    meta: { authorize: [0, 1, 2, 3] },
    component: FocusGroupSessionView,
    props: true,
  },
  {
    path: '/focusGroup/dashboard/:id',
    alias: '/focusGroup/manager/:id',
    name: 'FocusGroupManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: '/focusGroup/edit/:id',
        name: 'FocusGroupEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditFocusGroupView,
      },
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
