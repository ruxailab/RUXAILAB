import ManagerView from '@/ux/FocusGroup/views/ManagerView.vue'
import EditFocusGroupView from '@/ux/FocusGroup/views/EditFocusGroupView.vue'
import FocusGroupSessionView from '@/ux/FocusGroup/views/FocusGroupSessionView.vue'
import FocusGroupAnswerView from '@/ux/FocusGroup/views/FocusGroupAnswerView.vue'
import SettingsView from '@/shared/views/SettingsView.vue'
import CooperatorsView from '@/shared/views/CooperatorsView.vue'
import ParticipantsView from '@/shared/views/ParticipantsView.vue'
import SessionsView from '@/shared/views/SessionsView.vue'
import StorageView from '@/shared/views/StorageView.vue'
import AuditTrailView from '@/shared/views/AuditTrailView.vue'
import { STUDY_CAPABILITY as C } from '@/shared/utils/studyAccessPolicy'

// `authorize` alone only checks the account-wide accessLevel, not this
// person's role in THIS study — anyone signed in could otherwise open any
// Focus Group's management URLs directly. `studyCapability` adds the real,
// per-study check (same pattern as the Heuristic/UserTest routers).
const studyMeta = (studyCapability) => ({
  authorize: [0, 1, 3],
  studyCapability,
  studyRouteBase: 'focusGroup',
})

// Every management view lives at /focusGroup/{segment}/:id, gated by the
// capability its sidebar entry uses — built from one list rather than
// repeating the same route block.
const MANAGER_CHILDREN = [
  {
    segment: 'edit',
    name: 'FocusGroupEditTest',
    component: EditFocusGroupView,
    capability: C.STUDY_EDIT,
  },
  {
    segment: 'settings',
    name: 'FocusGroupSettingsView',
    component: SettingsView,
    capability: C.SETTINGS_MANAGE,
  },
  {
    // Session answers are for the people running or watching the study, not
    // participants — ANSWERS_VIEW is already granted only to facilitator
    // (Admin) and observer in the Focus Group policy, matching the redirect
    // FocusGroupAnswerView.vue does client-side as a second layer. Aliased
    // to the singular /answer path the shared "Results" nav item expects
    // (same alias Heuristic's own results/answer route uses).
    segment: 'answers',
    alias: 'answer',
    name: 'FocusGroupAnswerView',
    component: FocusGroupAnswerView,
    capability: C.ANSWERS_VIEW,
  },
  {
    segment: 'cooperators',
    name: 'FocusGroupCooperatorsView',
    component: CooperatorsView,
    capability: C.COOPERATORS_VIEW,
  },
  {
    segment: 'participants',
    name: 'FocusGroupParticipantsView',
    component: ParticipantsView,
    capability: C.COOPERATORS_VIEW,
  },
  {
    segment: 'sessions',
    name: 'FocusGroupSessionsView',
    component: SessionsView,
    capability: C.SESSIONS_MANAGE,
  },
  {
    segment: 'storage',
    name: 'FocusGroupStorageView',
    component: StorageView,
    capability: C.STORAGE_ACCESS,
  },
  {
    // Owner-only, matching the navigator (buildStudyNavigator only lists
    // Audit Trail for the study owner) and the other study routers' pattern.
    segment: 'audit',
    name: 'FocusGroupAuditTrailView',
    component: AuditTrailView,
    ownerOnly: true,
  },
].map(({ segment, alias, name, component, capability, ownerOnly }) => ({
  path: `/focusGroup/${segment}/:id`,
  ...(alias ? { alias: `/focusGroup/${alias}/:id` } : {}),
  name,
  props: true,
  meta: ownerOnly
    ? { authorize: [0, 1], studyOwnerOnly: true, studyRouteBase: 'focusGroup' }
    : studyMeta(capability),
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
    meta: studyMeta(C.DASHBOARD_VIEW),
    component: ManagerView,
    props: true,
    children: MANAGER_CHILDREN,
  },
]
