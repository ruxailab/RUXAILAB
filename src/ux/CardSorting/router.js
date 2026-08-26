import ManagerView from '@/ux/CardSorting/views/ManagerView.vue'
import EditTestView from '@/ux/CardSorting/views/EditTestView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import ParticipantsView from '@/shared/views/ParticipantsView.vue'
import ReportView from '@/shared/views/ReportView.vue'
import StorageView from '@/shared/views/StorageView.vue'
import AuditTrailView from '@/shared/views/AuditTrailView.vue'
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
        path: '/cardSorting/report/:id',
        alias: '/cardSorting/progress/:id',
        name: 'CardSortingReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: '/cardSorting/answer/:id',
        alias: '/cardSorting/results/:id',
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
      {
        path: '/cardSorting/participants/:id',
        name: 'CardSortingParticipantsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ParticipantsView,
      },
      {
        path: '/cardSorting/storage/:id/:token?',
        name: 'CardSortingStorageView',
        props: true,
        meta: { authorize: [0, 1] },
        component: StorageView,
      },
      {
        path: '/cardSorting/audit/:id/:token?',
        name: 'CardSortingAuditTrailView',
        props: true,
        meta: {
          authorize: [0, 1],
          studyOwnerOnly: true,
        },
        component: AuditTrailView,
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
