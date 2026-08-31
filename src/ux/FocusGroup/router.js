import ManagerView from '@/ux/FocusGroup/views/ManagerView.vue'
import EditFocusGroupView from '@/ux/FocusGroup/views/EditFocusGroupView.vue'
import FocusGroupSessionView from '@/ux/FocusGroup/views/FocusGroupSessionView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import ParticipantsView from '@/shared/views/ParticipantsView.vue'
import SessionsView from '@/shared/views/SessionsView.vue'
import StorageView from '@/shared/views/StorageView.vue'
import AuditTrailView from '@/shared/views/AuditTrailView.vue'

// Every management view lives at /focusGroup/{segment}/:id and is facilitator-
// only, so build them from one list rather than repeating the same route block.
const MANAGER_CHILDREN = [
  { segment: 'edit', name: 'FocusGroupEditTest', component: EditFocusGroupView },
  { segment: 'settings', name: 'FocusGroupSettingsView', component: SettingsView },
  {
    segment: 'cooperators',
    name: 'FocusGroupCooperatorsView',
    component: CooperatorsView,
  },
  {
    segment: 'participants',
    name: 'FocusGroupParticipantsView',
    component: ParticipantsView,
  },
  { segment: 'sessions', name: 'FocusGroupSessionsView', component: SessionsView },
  { segment: 'storage', name: 'FocusGroupStorageView', component: StorageView },
  {
    segment: 'audit',
    name: 'FocusGroupAuditTrailView',
    component: AuditTrailView,
  },
].map(({ segment, name, component }) => ({
  path: `/focusGroup/${segment}/:id`,
  name,
  props: true,
  meta: { authorize: [0, 1] },
  component,
}))

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
    children: MANAGER_CHILDREN,
  },
]
