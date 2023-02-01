import EditTest from "@/views/admin/EditTestView.vue";
import TestList from "@/views/admin/TestListView.vue";
import AnswerView from "@/views/admin/AnswerView.vue";
import ManagerView from "@/views/admin/ManagerView.vue";
import ReportView from "@/views/admin/ReportView.vue";
import CooperatorsView from "@/views/admin/CooperatorsView.vue";
import SettingsView from "@/views/admin/SettingsView.vue";
import AnalyticsView from "@/views/admin/AnalyticsView.vue"
import TemplateView from "@/views/admin/TemplateView.vue"
import CreateView from "@/views/admin/CreateView.vue";
import CreateFromTemplate from "@/views/admin/CreateFromTemplateView.vue";

export default [
  {
    path: "/testslist",
    name: "TestList",
    meta: { authorize: [1] },
    component: TestList,
  },
  {
    path: "/managerview/:id/:token?",
    name: "Manager View",
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: "/reportview/:id",
        name: "Report View",
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: "/answerview/:id",
        name: "Answer View",
        props: true,
        meta: { authorize: [0, 1] },
        component: AnswerView,
      },
      {
        path: "/edittest/:id",
        name: "Edit Test",
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: "/settingsview/:id",
        name: "Settings View",
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: "/cooperators/:id",
        name: "Cooperators View",
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
      {
        path: "/analyticsview/:id/:heuristic?",
        name: "Analytics View",
        props: true,
        meta: { authorize: [0, 1] },
        component: AnalyticsView
      },
      {
        path: "/templateview/:id",
        name: "Template View",
        props: true,
        meta: { authorize: [0, 1] },
        component: TemplateView
      }
    ]
  },
  {
    path: "/createtest",
    name: "Create View",
    meta: { authorize: [1] },
    component: CreateView,
  },
  {
    path: "/fromtemplate",
    name: "Create from template",
    meta: { authorize: [1] },
    component: CreateFromTemplate
  }
];
