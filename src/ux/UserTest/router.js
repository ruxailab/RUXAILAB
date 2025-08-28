import ManagerView from '@/views/admin/ManagerView.vue'
import ReportView from '@/views/admin/ReportView.vue'
import EditTest from '@/views/admin/EditTestView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import CooperatorsModeratedView from './views/Moderators/CooperatorsModeratedView.vue'
import UserAnswerView from './views/UserAnswerView.vue'

export default [
  {
    path: '/userTest/unmoderated/manager/:id/:token?',
    name: 'UserTestUnmoderatedManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: 'report/:id/:token?',
        name: 'UserTestUnmoderatedReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: 'answers/:id/:token?',
        name: 'UserTestUnmoderatedAnswersView',
        props: true,
        meta: { authorize: [0, 1] },
        component: UserAnswerView,
      },
      {
        path: 'edit/:id/:token?',
        name: 'UserTestUnmoderatedEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: 'settings/:id/:token?',
        name: 'UserTestUnmoderatedSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: 'cooperators/:id/:token?',
        name: 'UserTestUnmoderatedCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
    ],
  },
  {
    path: '/userTest/moderated/manager/:id/:token?',
    name: 'UserTestModeratedManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: 'report/:id/:token?',
        name: 'UserTestModeratedReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: 'answers/:id/:token?',
        name: 'UserTestModeratedAnswersView',
        props: true,
        meta: { authorize: [0, 1] },
        component: UserAnswerView,
      },
      {
        path: 'edit/:id/:token?',
        name: 'UserTestModeratedEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: 'settings/:id/:token?',
        name: 'UserTestModeratedSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: 'cooperators/:coopid/:token?',
        name: 'UserTestModeratedCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsModeratedView,
      },
    ],
  },
]
