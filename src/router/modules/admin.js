import EditTest from "@/views/admin/EditTestView.vue";
import TestList from "@/views/admin/TestListView.vue";
import AnswerView from "@/views/admin/AnswerView.vue";
import ManagerView from "@/views/admin/ManagerView.vue";
import ReportView from "@/views/admin/ReportView.vue";
import CooperatorsView from "@/views/admin/CooperatorsView.vue";
import SettingsView from "@/views/admin/SettingsView.vue";
import AnalyticsView from "@/views/admin/AnalyticsView.vue"

export default [
  {
    path: "/testslist",
    name: "TestList",
    meta: { authorize: [1] },
    component: TestList,
  },
  {
    path: "/managerview/:id",
    name: "Manager View",
    meta: { authorize: [1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: "/reportview/:id",
        name: "Report View",
        props: true,
        meta: { authorize: [1] },
        component: ReportView,
      },
      {
        path: "/answerview/:id",
        name: "Answer View",
        props: true,
        meta: { authorize: [1] },
        component: AnswerView,
      },
      {
        path: "/edittest/:id",
        name: "Edit Test",
        props: true,
        meta: { authorize: [1] },
        component: EditTest,
      },
      {
        path: "/settingsview/:id",
        name: "Settings View",
        props: true,
        meta: { authorize: [1] },
        component: SettingsView,
      },
      {
        path: "/cooperatorsview/:id",
        name: "Cooperators View",
        props: true,
        meta: { authorize: [1] },
        component: CooperatorsView,
      },
      {
        path: "/analyticsview/:id/:heuristic?",
        name: "Analytics View",
        props: true,
        meta: { authorize: [1] },
        component: AnalyticsView
      }
    ],
  },
];
