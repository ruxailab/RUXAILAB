import { STUDY_CAPABILITY as C } from '@/shared/utils/studyAccessPolicy'

const ManagerView = () =>
  import(
    /* webpackChunkName: "card-sorting" */ '@/ux/CardSorting/views/ManagerView.vue'
  )
const EditTestView = () =>
  import(
    /* webpackChunkName: "card-sorting" */ '@/ux/CardSorting/views/EditTestView.vue'
  )
const CardSortingAnswerView = () =>
  import(
    /* webpackChunkName: "card-sorting" */ '@/ux/CardSorting/views/CardSortingAnswerView.vue'
  )
const TestView = () =>
  import(/* webpackChunkName: "test-view" */ '@/views/public/TestView.vue')

const SettingsView = () =>
  import(/* webpackChunkName: "study-shared" */ '@/shared/views/SettingsView.vue')
const CooperatorsView = () =>
  import(
    /* webpackChunkName: "study-shared" */ '@/shared/views/CooperatorsView.vue'
  )
const ParticipantsView = () =>
  import(
    /* webpackChunkName: "study-shared" */ '@/shared/views/ParticipantsView.vue'
  )
const ReportView = () =>
  import(/* webpackChunkName: "study-shared" */ '@/shared/views/ReportView.vue')
const StorageView = () =>
  import(/* webpackChunkName: "study-shared" */ '@/shared/views/StorageView.vue')
const AuditTrailView = () =>
  import(
    /* webpackChunkName: "study-shared" */ '@/shared/views/AuditTrailView.vue'
  )
const LogsView = () =>
  import(/* webpackChunkName: "study-shared" */ '@/shared/views/LogsView.vue')

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
        path: '/cardSorting/logs/:id',
        name: 'CardSortingLogsView',
        props: true,
        meta: {
          authorize: [0, 1],
          studyCapability: C.LOGS_VIEW,
          studyRouteBase: 'cardSorting',
        },
        component: LogsView,
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
        meta: {
          authorize: [0, 1],
          studyCapability: C.COOPERATORS_VIEW,
          studyRouteBase: 'cardSorting',
        },
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
