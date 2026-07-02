import ManagerView from '@/ux/Heuristic/views/ManagerView.vue'
import ReportView from '@/shared/views/ReportView.vue'
import EditTest from '@/ux/Heuristic/views/EditTest.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import FinalReportView from '@/ux/Heuristic/views/FinalReportView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import HeuristicAnalyticsView from './views/HeuristicAnalyticsView.vue'
import HeuristicAnswerView from './views/HeuristicAnswerView.vue'
import EvaluatorInfoView from './views/EvaluatorInfoView.vue'

export default [
  {
    path: '/heuristic/dashboard/:id/:token?',
    alias: '/heuristic/manager/:id/:token?',
    name: 'HeuristicManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: '/heuristic/progress/:id/:token?',
        alias: '/heuristic/report/:id/:token?',
        name: 'HeuristicReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: '/heuristic/finalreport/:id/:token?',
        name: 'HeuristicFinalReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: FinalReportView,
      },
      {
        path: '/heuristic/results/:id/:token?',
        alias: '/heuristic/answer/:id/:token?',
        name: 'HeuristicAnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: HeuristicAnswerView,
      },
      {
        path: '/heuristic/edit/:id/:token?',
        name: 'HeuristicEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: '/heuristic/settings/:id/:token?',
        name: 'HeuristicSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/heuristic/cooperators/:id/:token?',
        name: 'HeuristicCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
      {
        path: '/heuristic/evaluatorinfo/:id/:token?',
        name: 'HeuristicEvaluatorInfoView',
        props: true,
        meta: { authorize: [0, 1] },
        component: EvaluatorInfoView,
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
