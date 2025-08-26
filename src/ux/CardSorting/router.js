import ManagerView from '@/ux/CardSorting/views/ManagerView.vue'
import EditTestView from '@/ux/CardSorting/views/EditTestView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/ux/CardSorting/views/CooperationsView.vue'
import TestView from '@/ux/CardSorting/views/TestView.vue'

export default [
  {
    path: '/cardSorting/managerview/:id',
    name: 'CardSortingManagerView',
    meta: { authorize: [0, 1] },
    component: () => ManagerView,
    props: true,
    children: [
      {
        path: '/cardSorting/edittest/:id',
        name: 'CardSortingEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: () => EditTestView,
      },
      {
        path: '/cardSorting/settingsview/:id',
        name: 'CardSortingSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/cardSorting/cooperators/:id',
        name: 'CardSortingCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
    ],
  },
  {
    path: '/cardSorting/testview/:id/:token?',
    name: 'CardSortingTestView',
    props: true,
    meta: { authorize: [] },
    component: TestView,
  },
]
