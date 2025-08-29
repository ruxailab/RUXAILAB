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
    name: 'UserUnmoderatedManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: 'report/:id/:token?',
        name: 'UserUnmoderatedReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: 'answers/:id/:token?',
        name: 'UserUnmoderatedAnswersView',
        props: true,
        meta: { authorize: [0, 1] },
        component: UserAnswerView,
      },
      {
        path: 'edit/:id/:token?',
        name: 'UserUnmoderatedEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: 'settings/:id/:token?',
        name: 'UserUnmoderatedSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: 'cooperators/:id/:token?',
        name: 'UserUnmoderatedCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
    ],
  },
  {
    path: '/userTest/moderated/manager/:id/:token?',
    name: 'UserModeratedManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: 'report/:id/:token?',
        name: 'UserModeratedReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: 'answers/:id/:token?',
        name: 'UserModeratedAnswersView',
        props: true,
        meta: { authorize: [0, 1] },
        component: UserAnswerView,
      },
      {
        path: 'edit/:id/:token?',
        name: 'UserModeratedEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: 'settings/:id/:token?',
        name: 'UserModeratedSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: 'cooperators/:coopid/:token?',
        name: 'UserModeratedCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsModeratedView,
      },
    ],
  },
]
