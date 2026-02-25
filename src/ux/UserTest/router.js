import ManagerMonderatedView from '@/ux/UserTest/views/Moderators/ManagerView.vue'
import ManagerUnmoderatedView from '@/ux/UserTest/views/Unmoderated/ManagerView.vue'
import ReportView from '@/shared/views/ReportView.vue'
import EditTest from '@/ux/UserTest/views/EditTestView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import CooperatorsModeratedView from './views/Moderators/CooperatorsModeratedView.vue'
import UserAnswerView from './views/UserAnswerView.vue'

export default [
  {
    path: '/userTest/unmoderated/manager/:id/:token?',
    name: 'UserUnmoderatedManagerView',
    meta: { authorize: [0, 1] },
    component: ManagerUnmoderatedView,
    props: true,
    children: [
      {
        path: '/userTest/unmoderated/report/:id/:token?',
        name: 'UserUnmoderatedReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: '/userTest/unmoderated/answer/:id/:token?',
        name: 'UserUnmoderatedAnswersView',
        props: true,
        meta: { authorize: [0, 1] },
        component: UserAnswerView,
      },
      {
        path: '/userTest/unmoderated/edit/:id/:token?',
        name: 'UserUnmoderatedEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: '/userTest/unmoderated/settings/:id/:token?',
        name: 'UserUnmoderatedSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/userTest/unmoderated/cooperators/:id/:token?',
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
    component: ManagerMonderatedView,
    props: true,
    children: [
      {
        path: '/userTest/moderated/report/:id/:token?',
        name: 'UserModeratedReportView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ReportView,
      },
      {
        path: '/userTest/moderated/answer/:id/:token?',
        name: 'UserModeratedAnswersView',
        props: true,
        meta: { authorize: [0, 1] },
        component: UserAnswerView,
      },
      {
        path: '/userTest/moderated/edit/:id/:token?',
        name: 'UserModeratedEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditTest,
      },
      {
        path: '/userTest/moderated/settings/:id/:token?',
        name: 'UserModeratedSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/userTest/moderated/cooperators/:id/:token?',
        name: 'UserModeratedCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsModeratedView,
      },
    ],
  },
]
