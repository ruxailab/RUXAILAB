import ManagerView from '@/ux/Heuristic/views/ManagerView.vue'
import ReportView from '@/shared/views/ReportView.vue'
import EditTest from '@/ux/Heuristic/views/EditTest.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import FinalReportView from '@/ux/Heuristic/views/FinalReportView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import HeuristicAnalyticsView from './views/HeuristicAnalyticsView.vue'
import HeuristicAnswerView from './views/HeuristicAnswerView.vue'
import EvaluatorInfoView from './views/EvaluatorInfoView.vue'
import StorageView from '@/shared/views/StorageView.vue'
import { STUDY_CAPABILITY as C } from '@/shared/utils/studyAccessPolicy'

const studyMeta = (studyCapability) => ({
  authorize: [0, 1],
  studyCapability,
  studyRouteBase: 'heuristic',
})

export default [
  {
    path: '/heuristic/manager/:id/:token?',
    name: 'HeuristicManagerView',
    meta: studyMeta(C.DASHBOARD_VIEW),
    component: ManagerView,
    props: true,
    children: [
      {
        path: '/heuristic/report/:id/:token?',
        name: 'HeuristicReportView',
        props: true,
        meta: studyMeta(C.REPORTS_VIEW),
        component: ReportView,
      },
      {
        path: '/heuristic/finalreport/:id/:token?',
        name: 'HeuristicFinalReportView',
        props: true,
        meta: studyMeta(C.FINAL_REPORT_MANAGE),
        component: FinalReportView,
      },
      {
        path: '/heuristic/answer/:id/:token?',
        name: 'HeuristicAnswerView',
        props: true,
        meta: studyMeta(C.ANSWERS_VIEW),
        component: HeuristicAnswerView,
      },
      {
        path: '/heuristic/edit/:id/:token?',
        name: 'HeuristicEditTest',
        props: true,
        meta: studyMeta(C.STUDY_EDIT),
        component: EditTest,
      },
      {
        path: '/heuristic/settings/:id/:token?',
        name: 'HeuristicSettingsView',
        props: true,
        meta: studyMeta(C.SETTINGS_MANAGE),
        component: SettingsView,
      },
      {
        path: '/heuristic/cooperators/:id/:token?',
        name: 'HeuristicCooperatorsView',
        props: true,
        meta: studyMeta(C.COOPERATORS_VIEW),
        component: CooperatorsView,
      },
      {
        path: '/heuristic/evaluatorinfo/:id/:token?',
        name: 'HeuristicEvaluatorInfoView',
        props: true,
        meta: studyMeta(C.EVALUATOR_INFO_MANAGE),
        component: EvaluatorInfoView,
      },
      {
        path: '/heuristic/storage/:id/:token?',
        name: 'HeuristicStorageView',
        props: true,
        meta: studyMeta(C.STORAGE_ACCESS),
        component: StorageView,
      } /*
      {
        path: '/heuristic/analytics/:id/:heuristic?',
        name: 'HeuristicAnalyticsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: HeuristicsAnalytics,
      },*/,
    ],
  },

  {
    path: '/heuristic-analytics',
    name: 'HeuristicAnalytics',
    component: HeuristicAnalyticsView,
    meta: { authorize: [1] },
  },
]
