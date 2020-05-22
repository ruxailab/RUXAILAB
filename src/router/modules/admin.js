import CreateTest from "@/views/admin/CreateTest.vue";
import TestList from "@/views/admin/TestList.vue";
import AnswerView from "@/views/admin/AnswerView.vue";

export default [
  {
    path: "/",
    name: "TestList",
    meta:{authorize:[1]},
    component: TestList,
  },
  {
    path: "/createtest",
    name: "Create Test",
    meta:{authorize:[1]},
    component: CreateTest,
  },
  {
    path: "/edittest/:id",
    name: "Edit Test",
    props: true,
    meta:{authorize:[1]},
    component: CreateTest,
  },
  {
    path: "/answerview/:id",
    name: "Answer View",
    props: true,
    meta:{authorize:[1]},
    component: AnswerView
  },
];
