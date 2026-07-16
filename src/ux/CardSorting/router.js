import ManagerView from '@/ux/CardSorting/views/ManagerView.vue'
import EditTestView from '@/ux/CardSorting/views/EditTestView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import ReportView from '@/shared/views/ReportView.vue'
import TestView from '@/ux/CardSorting/views/TestView.vue'
import CardSortingAnswerView from '@/ux/CardSorting/views/CardSortingAnswerView.vue'

export default [
  {
    path: '/cardSorting/dashboard/:id',
    alias: '/cardSorting/manager/:id',
    name: 'CardSortingManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: '/cardSorting/edit/:id',
        name: 'CardSortingEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTestView,
      },
      {
        path: '/cardSorting/progress/:id',
        name: 'CardSortingReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: '/cardSorting/results/:id',
        name: 'CardSortingAnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CardSortingAnswerView,
      },
      {
        path: '/cardSorting/settings/:id',
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
    path: '/cardSorting/test/:id',
    name: 'CardSortingTestView',
    props: true,
    meta: { authorize: [] },
    component: TestView,
  },
]
