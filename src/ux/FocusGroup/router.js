import ManagerView from '@/ux/FocusGroup/views/ManagerView.vue'
import EditFocusGroupView from '@/ux/FocusGroup/views/EditFocusGroupView.vue'
import FocusGroupSessionView from '@/ux/FocusGroup/views/FocusGroupSessionView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import ParticipantsView from '@/shared/views/ParticipantsView.vue'
import SessionsView from '@/shared/views/SessionsView.vue'
import StorageView from '@/shared/views/StorageView.vue'
import AuditTrailView from '@/shared/views/AuditTrailView.vue'

export default [
  {
    path: '/focusGroup/session/:id',
    name: 'FocusGroupSessionView',
    meta: { authorize: [0, 1, 2, 3], layout: 'no-toolbar' },
    component: FocusGroupSessionView,
    props: true,
  },
  {
    path: '/focusGroup/dashboard/:id',
    alias: '/focusGroup/manager/:id',
    name: 'FocusGroupManagerView',
    // Observers (3) reach the dashboard too — the sidebar then shows only what
    // their role allows. The management children below stay facilitator-only.
    meta: { authorize: [0, 1, 3] },
    component: ManagerView,
    props: true,
    children: [
      {
        path: '/focusGroup/edit/:id',
        name: 'FocusGroupEditTest',
        props: true,
        meta: { authorize: [0, 1] },
        component: EditFocusGroupView,
      },
      {
        path: '/focusGroup/settings/:id',
        name: 'FocusGroupSettingsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SettingsView,
      },
      {
        path: '/focusGroup/cooperators/:id',
        name: 'FocusGroupCooperatorsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: CooperatorsView,
      },
      {
        path: '/focusGroup/participants/:id',
        name: 'FocusGroupParticipantsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: ParticipantsView,
      },
      {
        path: '/focusGroup/sessions/:id',
        name: 'FocusGroupSessionsView',
        props: true,
        meta: { authorize: [0, 1] },
        component: SessionsView,
      },
      {
        path: '/focusGroup/storage/:id',
        name: 'FocusGroupStorageView',
        props: true,
        meta: { authorize: [0, 1] },
        component: StorageView,
      },
      {
        path: '/focusGroup/audit/:id',
        name: 'FocusGroupAuditTrailView',
        props: true,
        meta: { authorize: [0, 1] },
        component: AuditTrailView,
      },
    ],
  },
]
