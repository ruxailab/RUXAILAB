import ManagerView from '@/views/admin/ManagerView.vue'
import ReportView from '@/views/admin/ReportView.vue'
import AnswerView from '@/views/admin/AnswerView.vue'
import EditTest from '@/views/admin/EditTestView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import FinalReportView from '@/ux/Heuristic/views/FinalReportView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import AnalyticsView from '@/views/admin/AnalyticsView.vue'
import TemplateView from '@/views/admin/TemplateView.vue'
import HeuristicAnalyticsView from './views/HeuristicAnalyticsView.vue';

export default [
  {
    path: '/heuristic/manager/:id/:token?',
    name: 'ManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: 'report/:id/:token?',
        name: 'ReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: 'finalreport/:id/:token?',
        name: 'FinalReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: FinalReportView,
      },
      {
        path: 'answer/:id/:token?',
        name: 'AnswerView',
        props: true,
        meta: { authorize: [0, 1] },
        component: AnswerView,
      },
      {
        path: 'edittest/:id/:token?',
        name: 'EditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: 'settings/:id/:token?',
        name: 'SettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: 'cooperators/:id/:token?',
        name: 'CooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
      {
        path: 'analytics/:id/:heuristic?',
        name: 'AnalyticsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: AnalyticsView,
      },
      {
        path: 'template/:id/:token?',
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
