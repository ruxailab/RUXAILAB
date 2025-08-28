import ManagerView from '@/ux/Heuristic/views/ManagerView.vue'
import ReportView from '@/views/admin/ReportView.vue'
import EditTest from '@/views/admin/EditTestView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import FinalReportView from '@/ux/Heuristic/views/FinalReportView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import AnalyticsView from '@/views/admin/AnalyticsView.vue'
import TemplateView from '@/views/admin/TemplateView.vue'
import HeuristicAnalyticsView from './views/HeuristicAnalyticsView.vue';
import HeuristicAnswerView from './views/HeuristicAnswerView.vue'

export default [
  {
    path: '/heuristic/manager/:id/:token?',
    name: 'ManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: '/heuristic/report/:id/:token?',
        name: 'ReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: '/heuristic/finalreport/:id/:token?',
        name: 'FinalReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: FinalReportView,
      },
      {
        path: '/heuristic/answer/:id/:token?',
        name: 'AnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: HeuristicAnswerView,
      },
      {
        path: '/heuristic/edit/:id/:token?',
        name: 'EditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: '/heuristic/settings/:id/:token?',
        name: 'SettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/heuristic/cooperators/:id/:token?',
        name: 'CooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
      {
        path: '/heuristic/analytics/:id/:heuristic?',
        name: 'AnalyticsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: AnalyticsView,
      },
      {
        path: '/heuristic/template/:id/:token?',
        name: 'TemplateView',
        props: true,
        meta: { authorize: [0, 1] },
        component: TemplateView,
      },
    ],
  },

  {
    path: '/heuristic-analytics',
    name: 'HeuristicAnalytics',
    component: HeuristicAnalyticsView,
    meta: { authorize: [1] },
  },
];
