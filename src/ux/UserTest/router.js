import ManagerMonderatedView from '@/ux/UserTest/views/Moderators/ManagerView.vue'
import ManagerUnmoderatedView from '@/ux/UserTest/views/Unmoderated/ManagerView.vue'
import ReportView from '@/shared/views/ReportView.vue'
import EditTest from '@/ux/UserTest/views/EditTestView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import CooperatorsModeratedView from './views/Moderators/CooperatorsModeratedView.vue'
import UserAnswerView from './views/UserAnswerView.vue'
import StorageView from '@/shared/views/StorageView.vue'
import { STUDY_CAPABILITY as C } from '@/shared/utils/studyAccessPolicy'
import AuditTrailView from '@/shared/views/AuditTrailView.vue'

const studyMeta = (studyCapability, studyRouteBase) => ({
  authorize: [0, 1],
  studyCapability,
  studyRouteBase,
})

export default [
  {
    path: '/userTest/unmoderated/manager/:id/:token?',
    name: 'UserUnmoderatedManagerView',
    meta: studyMeta(C.DASHBOARD_VIEW, 'userTest/unmoderated'),
    component: ManagerUnmoderatedView,
    props: true,
    children: [
      {
        path: '/userTest/unmoderated/report/:id/:token?',
        name: 'UserUnmoderatedReportView',
        props: true,
        meta: studyMeta(C.REPORTS_VIEW, 'userTest/unmoderated'),
        component: ReportView,
      },
      {
        path: '/userTest/unmoderated/answer/:id/:token?',
        name: 'UserUnmoderatedAnswersView',
        props: true,
        meta: studyMeta(C.ANSWERS_VIEW, 'userTest/unmoderated'),
        component: UserAnswerView,
      },
      {
        path: '/userTest/unmoderated/edit/:id/:token?',
        name: 'UserUnmoderatedEditTest',
        props: true,
        meta: studyMeta(C.STUDY_EDIT, 'userTest/unmoderated'),
        component: EditTest,
      },
      {
        path: '/userTest/unmoderated/settings/:id/:token?',
        name: 'UserUnmoderatedSettingsView',
        props: true,
        meta: studyMeta(C.SETTINGS_MANAGE, 'userTest/unmoderated'),
        component: SettingsView,
      },
      {
        path: '/userTest/unmoderated/cooperators/:id/:token?',
        name: 'UserUnmoderatedCooperatorsView',
        props: true,
        meta: studyMeta(C.COOPERATORS_VIEW, 'userTest/unmoderated'),
        component: CooperatorsView,
      },
      {
        path: '/userTest/unmoderated/storage/:id/:token?',
        name: 'UserUnmoderatedStorageView',
        props: true,
        meta: studyMeta(C.STORAGE_ACCESS, 'userTest/unmoderated'),
        component: StorageView,
      },
      {
        path: '/userTest/unmoderated/audit/:id',
        name: 'UserUnmoderatedAuditTrailView',
        props: true,
        meta: {
          authorize: [0, 1],
          studyOwnerOnly: true,
          studyRouteBase: 'userTest/unmoderated',
        },
        component: AuditTrailView,
      },
    ],
  },
  {
    path: '/userTest/moderated/manager/:id/:token?',
    name: 'UserModeratedManagerView',
    meta: studyMeta(C.DASHBOARD_VIEW, 'userTest/moderated'),
    component: ManagerMonderatedView,
    props: true,
    children: [
      {
        path: '/userTest/moderated/report/:id/:token?',
        name: 'UserModeratedReportView',
        props: true,
        meta: studyMeta(C.REPORTS_VIEW, 'userTest/moderated'),
        component: ReportView,
      },
      {
        path: '/userTest/moderated/answer/:id/:token?',
        name: 'UserModeratedAnswersView',
        props: true,
        meta: studyMeta(C.ANSWERS_VIEW, 'userTest/moderated'),
        component: UserAnswerView,
      },
      {
        path: '/userTest/moderated/edit/:id/:token?',
        name: 'UserModeratedEditTest',
        props: true,
        meta: studyMeta(C.STUDY_EDIT, 'userTest/moderated'),
        component: EditTest,
      },
      {
        path: '/userTest/moderated/settings/:id/:token?',
        name: 'UserModeratedSettingsView',
        props: true,
        meta: studyMeta(C.SETTINGS_MANAGE, 'userTest/moderated'),
        component: SettingsView,
      },
      {
        path: '/userTest/moderated/cooperators/:id/:token?',
        name: 'UserModeratedCooperatorsView',
        props: true,
        meta: studyMeta(C.COOPERATORS_VIEW, 'userTest/moderated'),
        component: CooperatorsModeratedView,
      },
      {
        path: '/userTest/moderated/storage/:id/:token?',
        name: 'UserModeratedStorageView',
        props: true,
        meta: studyMeta(C.STORAGE_ACCESS, 'userTest/moderated'),
        component: StorageView,
      },
      {
        path: '/userTest/moderated/audit/:id',
        name: 'UserModeratedAuditTrailView',
        props: true,
        meta: {
          authorize: [0, 1],
          studyOwnerOnly: true,
          studyRouteBase: 'userTest/moderated',
        },
        component: AuditTrailView,
      },
    ],
  },
]
