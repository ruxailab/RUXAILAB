<template>
  <PageWrapper
    :title="!showIntroView ? $t('HeuristicsCooperators.title.cooperators') : ''"
  >
    <!-- Actions Slot -->
    <template v-if="!showIntroView" #actions>
      <v-menu>
        <template #activator="{ props }">
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-account-plus"
            variant="flat"
            class="px-6"
            v-bind="props"
          >
            {{ $t('HeuristicsCooperators.actions.send_invitation') }}
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            prepend-icon="mdi-email-outline"
            @click="showInviteDialog = true"
          >
            <v-list-item-title>
              {{ $t('cooperators.invite.byEmail') }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            prepend-icon="mdi-link-variant"
            @click="showLinkInviteDialog = true"
          >
            <v-list-item-title>
              {{ $t('cooperators.invite.generateLink') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- Subtitle Slot -->
    <template v-if="!showIntroView" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('HeuristicsCooperators.subtitles.manage_participants') }}
      </p>
    </template>
    <!-- Main Content -->
    <Intro v-if="showIntroView" @close-intro="showIntroComponent = false" />
    <CooperatorTable
      v-else
      :has-role-column="hasRoleColumn"
      :cooperators="cooperatorsEdit"
      :loading="loading"
      :show-date-columns="showDateColumns"
      :show-session-column="showSessionColumn"
      :message-text="$t('HeuristicsCooperators.actions.send_message')"
      :reinvite-text="$t('HeuristicsCooperators.actions.reinvite')"
      :remove-text="$t('HeuristicsCooperators.actions.remove_cooperator')"
      :cancel-text="$t('HeuristicsCooperators.actions.cancel_invitation')"
      @role-change="changeRole"
      @send-message="openMessageDialog"
      @reinvite="reinvite"
      @remove-cooperator="removeCoop"
      @cancel-invitation="cancelInvitation"
    />

    <!-- Leave Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <LeaveAlert />
    </v-dialog>

    <!-- Message Dialog -->
    <MessageDialog
      v-model:show="messageModel"
      :selected-user="selectedUser"
      :title="$t('HeuristicsCooperators.actions.send_message')"
      :title-label="$t('HeuristicsCooperators.headers.title')"
      :title-hint="$t('HeuristicsCooperators.messages.message_title_hint')"
      :content-label="$t('HeuristicsCooperators.headers.content')"
      :content-hint="$t('HeuristicsCooperators.messages.message_content_hint')"
      :cancel-text="$t('HeuristicsCooperators.actions.cancel')"
      :send-text="$t('HeuristicsCooperators.actions.send')"
      @send-message="handleSendMessage"
    />

    <!-- Invite Dialog -->
    <InviteDialog
      v-model:show="showInviteDialog"
      :existing-cooperators="cooperatorsEdit"
      :current-user-email="userAuth?.email"
      :study-owner-email="test?.testAdmin?.email"
      :show-date-time-selection="false"
      :title="$t('HeuristicsCooperators.actions.send_invitation')"
      :select-label="$t('HeuristicsCooperators.actions.select_cooperator')"
      :no-data-text="$t('HeuristicsCooperators.messages.no_users')"
      :role-label="$t('HeuristicsCooperators.headers.role')"
      :cancel-text="$t('HeuristicsCooperators.actions.cancel')"
      :send-text="$t('HeuristicsCooperators.actions.send')"
      :users="cooperatorsEdit"
      @send-invitations="handleSendInvitations"
    />

    <!-- Generate Invite Link -->
    <GenerateInviteLinkDialog
      v-model:show="showLinkInviteDialog"
      :study-id="test?.id"
      :study-title="test?.testTitle"
      :requires-login="true"
    />

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      v-model:show="confirmDialog.show"
      :title="confirmDialog.title"
      :subtitle="confirmDialog.subtitle"
      :message="confirmDialog.message"
      :confirm-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      :confirm-color="confirmDialog.confirmColor"
      :confirm-icon="confirmDialog.confirmIcon"
      :icon="confirmDialog.icon"
      :icon-color="confirmDialog.iconColor"
      :type="confirmDialog.type"
      :loading="confirmDialog.loading"
      @confirm="handleConfirmAction"
      @cancel="handleCancelAction"
    >
      <template v-if="confirmDialog.action === 'changeRole'" #content>
        <v-row class="align-center ma-2">
          <v-chip
            :color="
              getRoleColor(
                roleOptions.find(
                  (r) => r.value === roleDialog.item?.accessLevel,
                )?.title,
              )
            "
            size="small"
            variant="flat"
          >
            <v-icon start size="16">
              {{
                getRoleIcon(
                  roleOptions.find(
                    (r) => r.value === roleDialog.item?.accessLevel,
                  )?.title,
                )
              }}
            </v-icon>

            {{
              roleOptions.find((r) => r.value === roleDialog.item?.accessLevel)
                ?.title
            }}
          </v-chip>

          <v-icon class="mx-2">mdi-arrow-right</v-icon>

          <v-select
            v-model="roleDialog.newRole"
            :items="
              roleOptions.filter(
                (r) => r.value !== roleDialog.item?.accessLevel,
              )
            "
            item-title="title"
            item-value="value"
            return-object
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 220px"
          />
        </v-row>
      </template>
    </ConfirmDialog>

    <AccessNotAllowed v-if="!loading && verified" />

    <slot
      name="dialog"
      :is-drawer-open="drawerOpen"
      :set-drawer-open="(val) => (drawerOpen = val)"
    />
  </PageWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import Intro from '@/shared/components/introduction_cards/IntroCoops.vue'
import AccessNotAllowed from '@/shared/views/AccessNotAllowed.vue'
import LeaveAlert from '@/shared/components/dialogs/LeaveAlert.vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import CooperatorTable from '@/shared/components/CooperatorTable.vue'
import MessageDialog from '@/shared/components/dialogs/MessageDialog.vue'
import InviteDialog from '@/shared/components/dialogs/InviteDialog.vue'
import GenerateInviteLinkDialog from '@/shared/components/dialogs/GenerateInviteLinkDialog.vue'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'
import UIDGenerator from 'uid-generator'
import {
  useCooperatorUtils,
  normalizeCooperatorInviteEntry,
  enrichCooperatorInviteEntry,
} from '@/shared/composables/useCooperatorUtils'
import { useCooperatorActions } from '@/shared/composables/useCooperatorActions'
import Cooperators from '../models/Cooperators'
import { getMethodManagerView } from '../constants/methodDefinitions'
import { useRouter, useRoute } from 'vue-router'
import Notification from '@/shared/models/Notification'
import EmailController from '../controllers/EmailController'
import { useI18n } from 'vue-i18n'
import { showSuccess, showError, showWarning } from '@/shared/utils/toast'

const uidgen = new UIDGenerator()
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
  hasRoleColumn: {
    type: Boolean,
    default: true,
  },
  showSessionColumn: {
    type: Boolean,
    default: false,
  },
  showDateColumns: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['open-invite-dialog'])

const store = useStore()
const route = useRoute()
const { t } = useI18n()

const {
  roleOptions,
  getCooperatorInviteValidationError,
  getRoleColor,
  getRoleIcon,
} = useCooperatorUtils()

useCooperatorActions() // Keep the hook call in case it has side effects

// Confirmation dialog state
const confirmDialog = ref({
  show: false,
  title: '',
  subtitle: '',
  message: '',
  confirmColor: 'primary',
  confirmIcon: '',
  icon: 'mdi-alert-circle-outline',
  iconColor: 'warning',
  type: 'warning',
  loading: false,
  action: null,
  data: null,
})

const roleDialog = ref({
  item: null,
  newRole: null,
})

const resetConfirmDialog = () => {
  confirmDialog.value = {
    show: false,
    title: '',
    subtitle: '',
    message: '',
    confirmColor: 'primary',
    confirmIcon: '',
    icon: 'mdi-alert-circle-outline',
    iconColor: 'warning',
    type: 'warning',
    loading: false,
    action: null,
    data: null,
  }

  roleDialog.value = {
    item: null,
    newRole: null,
  }
}

const handleConfirmAction = async () => {
  const { action, data } = confirmDialog.value
  confirmDialog.value.loading = true

  try {
    if (action === 'changeRole') {
      await executeRoleChange(roleDialog.value.item, roleDialog.value.newRole)
      showSuccess('Role updated successfully!')
    } else if (action === 'removeCooperator') {
      await executeCooperatorRemoval(data.coop)
      showSuccess('Cooperator removed successfully!')
    } else if (action === 'cancelInvitation') {
      await executeInvitationCancellation(data.guest)
      showSuccess('Invitation cancelled successfully!')
    }
  } catch {
    showError(
      `Failed to ${action === 'changeRole' ? 'update role' : action === 'removeCooperator' ? 'remove cooperator' : 'cancel invitation'}.`,
    )
  } finally {
    resetConfirmDialog()
  }
}

const handleCancelAction = () => {
  resetConfirmDialog()
}

const sendNotification = async ({
  userId,
  title,
  titleTemplate,
  titleParams,
  description,
  descriptionTemplate,
  descriptionParams,
  redirectsTo = '/',
  testId = null,
  author,
  type,
  accessLevel,
} = {}) => {
  const notification = new Notification({
    title,
    titleTemplate,
    titleParams,
    description,
    descriptionTemplate,
    descriptionParams,
    redirectsTo,
    author,
    read: false,
    testId,
    type,
    accessLevel,
  })

  try {
    await store.dispatch('addNotification', {
      userId,
      notification,
    })
    return true
  } catch (error) {
    throw error
  }
}

let showIntroComponent = ref(true)
const inviteMessages = ref('')
const verified = ref(false)
const messageModel = ref(false)
const selectedUser = ref([])
const cooperatorsUpdate = ref([])
const showInviteDialog = ref(false)
const showLinkInviteDialog = ref(false)
const drawerOpen = ref(false)

const showIntroView = computed(() => {
  return cooperatorsEdit.value.length <= 0 && showIntroComponent.value
})

const dialog = computed(() => store.getters.getDialogLeaveStatus)
const test = computed(() => store.getters.test)
const userAuth = computed(() => store.getters.user)
const cooperatorsEdit = computed(() =>
  test.value?.cooperators ? [...test.value.cooperators] : [],
)
const loading = computed(() => store.getters.loading)

const openMessageDialog = (item) => {
  selectedUser.value = item
  messageModel.value = true
}

const handleSendMessage = async ({ user, title, content }) => {
  messageModel.value = false
  if (user.userDocId && test.value) {
    const author = userAuth.value.email
    try {
      await sendNotification({
        userId: user.userDocId,
        title: title,
        author: author,
        description: content,
        redirectsTo: null,
        testId: test.value.id,
        type: 'Message',
      })
      showSuccess('HeuristicsCooperators.messages.message_sent_success')
    } catch {
      showError('HeuristicsCooperators.messages.message_sent_error')
    }
  } else {
    showWarning('HeuristicsCooperators.messages.user_not_registered')
  }
}

const resolveUserByEmail = async (email) => {
  if (!email) return null

  try {
    const response = await store.dispatch('findUserByEmail', {
      email,
    })

    return response || null
  } catch {
    return null
  }
}

const handleSendEmail = async (guest, customMessage = null) => {
  const emailController = new EmailController()
  const inviteMessage =
    customMessage ?? guest?.inviteMessage ?? inviteMessages.value ?? ''

  await emailController.send({
    to: guest.email,
    subject: t('HeuristicsCooperators.actions.send_invitation'),
    attachments: [],
    template: 'invite',
    data: {
      message: inviteMessage,
      testTitle: test.value.testTitle,
      testDescription: test.value.testDescription,
      adminEmail: test.value.testAdmin.email,
      adminName: userAuth.value.name || userAuth.value.email,
      studyId: test.value.id,
      isPublic: false, // Assuming all invites are private for now
      accessLevel: guest.accessLevel,
      requiredLogin: true,
    },
  })
}

const handleSendInvitations = async (invitationData) => {
  if (!test.value) return

  const { selectedCoops, selectedRole, inviteMessage } = invitationData
  const tokens = {}
  const newInvites = []
  const updatedRoles = []

  inviteMessages.value = inviteMessage
  cooperatorsUpdate.value = [...cooperatorsEdit.value]

  for (const coop of selectedCoops) {
    const normalizedEntry = normalizeCooperatorInviteEntry(coop)
    const coopEmail =
      normalizedEntry?.email || (typeof coop === 'object' ? coop.email : coop)
    const normalizedEmail = coopEmail?.trim().toLowerCase()

    const validationError = getCooperatorInviteValidationError({
      email: normalizedEmail,
      currentUserEmail: userAuth.value?.email,
      studyOwnerEmail: test.value?.testAdmin?.email,
      existingCooperators: cooperatorsEdit.value,
      t,
    })

    if (validationError) {
      showError(validationError)
      continue
    }

    const enrichedEntry = await enrichCooperatorInviteEntry(coop, {
      resolveUserByEmail,
    })

    const existingIndex = cooperatorsEdit.value.findIndex(
      (c) => c.email?.trim().toLowerCase() === normalizedEmail,
    )

    if (existingIndex === -1) {
      const token = uidgen.generateSync()
      cooperatorsEdit.value.push({
        userDocId: enrichedEntry?.userDocId || null,
        email: coopEmail,
        invited: true,
        accepted: false,
        accessLevel: roleOptions.value[selectedRole].value,
        inviteMessage: inviteMessage || null,
        token,
        progress: 0,
        updateDate: test.value?.updateDate || new Date().toISOString(),
        testAuthorEmail: test.value?.testAdmin?.email || '',
      })
      tokens[enrichedEntry?.userDocId || coopEmail] = token
      newInvites.push(coopEmail)
    } else {
      const existing = cooperatorsEdit.value[existingIndex]
      const newRole = roleOptions.value[selectedRole].value

      if (
        existing.accessLevel !== newRole ||
        existing.inviteMessage !== inviteMessage
      ) {
        cooperatorsEdit.value[existingIndex] = {
          ...existing,
          accessLevel: newRole,
          inviteMessage: inviteMessage || existing.inviteMessage || null,
          updateDate: new Date().toISOString(),
        }
        updatedRoles.push(coopEmail)
      }
      tokens[enrichedEntry?.userDocId || coopEmail] = existing.token
    }
  }

  await submit()
  showInviteDialog.value = false

  // Show appropriate feedback
  if (updatedRoles.length > 0) {
    showSuccess(
      t('cooperators.updatedRole', {
        role: roleOptions.value[selectedRole].title,
        users: updatedRoles.join(', '),
      }),
    )
  }
  if (newInvites.length > 0) {
    showSuccess(t('cooperators.inviteSent', { users: newInvites.join(', ') }))
  }
}

const changeRole = (item) => {
  roleDialog.value = {
    item,
    newRole: roleOptions.value.find((r) => r.value !== item.accessLevel),
  }

  confirmDialog.value = {
    show: true,
    title:
      t('HeuristicsCooperators.messages.change_role_title') || 'Change Role',
    subtitle:
      t('pages.settings.action_cannot_be_undone') ||
      "This action will update the user's permissions",
    message: '',
    confirmColor: 'primary',
    confirmIcon: 'mdi-check',
    icon: 'mdi-account-convert',
    iconColor: 'primary',
    type: 'info',
    loading: false,
    action: 'changeRole',
  }
}

const executeRoleChange = async (item, newValue) => {
  const cooperators = Array.isArray(test.value?.cooperators)
    ? test.value.cooperators
    : []

  const index = cooperators.findIndex(
    (coop) =>
      (coop.token && item.token && coop.token === item.token) ||
      (coop.userDocId && item.userDocId && coop.userDocId === item.userDocId) ||
      (coop.email && item.email && coop.email === item.email),
  )

  if (index < 0) {
    throw new Error('COOPERATOR_NOT_FOUND')
  }

  const updatedCooperators = [...cooperators]
  const newCoop = new Cooperators({
    ...updatedCooperators[index],
    accessLevel: newValue.value,
  })
  updatedCooperators[index] = newCoop
  test.value.cooperators = updatedCooperators
  await store.dispatch('updateStudy', test.value)
  await store.dispatch('getStudy', { id: test.value.id })

  // Pending/rejected collaborators may not have an answer document yet.
  // Role update is still valid, so only sync answer metadata when the
  // collaborator is accepted and linked to a user document.
  if (!newCoop.userDocId || newCoop.accepted !== true) {
    return
  }

  await store.dispatch('updateUserAnswer', {
    testDocId: test.value.id,
    cooperatorId: newCoop.userDocId,
    data: { accessLevel: newCoop.accessLevel },
  })
}

const submit = async () => {
  if (!test.value) return

  const coops = cooperatorsEdit.value.map(
    (coop) =>
      new Cooperators({ ...coop, userDocId: coop.userDocId || coop.id }),
  )
  test.value.cooperators = [...coops]

  const newCooperators = cooperatorsEdit.value.filter(
    (guest) => !cooperatorsUpdate.value.some((c) => c.email === guest.email),
  )

  try {
    await store.dispatch('updateStudy', test.value)

    await Promise.all([
      store.dispatch('getStudy', { id: test.value.id }),
      ...newCooperators.map((guest) =>
        sendMenssages(guest, guest.inviteMessage),
      ),
    ])
  } catch {
    // console.error('Error updating study:', error)
  }
}

const sendMenssages = async (guest, customMessage = null) => {
  const messageToSend =
    customMessage ?? guest?.inviteMessage ?? inviteMessages.value ?? ''

  try {
    const resolvedGuest = await enrichCooperatorInviteEntry(guest, {
      resolveUserByEmail,
    })

    if (resolvedGuest.userDocId) {
      guest.userDocId = resolvedGuest.userDocId
    }

    await notifyCooperator(guest, messageToSend)
    // Email is optional - don't let it block the notification
    try {
      await handleSendEmail(guest, messageToSend)
    } catch {
      // console.warn('Email sending failed (may be missing VUE_APP_CLOUD_FUNCTIONS_URL):', emailError.message)
    }
    showSuccess('pages.cooperators.invitationSent')
  } catch {
    // console.error('sendMenssages error:', error)
    showError('errors.sendError')
    return error
  }
}

const notifyCooperator = async (guest, customMessage = null) => {
  if (guest.userDocId) {
    // Check if it's an accessibility test (MANUAL or AUTOMATIC)
    //if (test.value.testType === 'MANUAL' || test.value.testType === 'AUTOMATIC') {
    //  notifyCooperatorAccessibility(guest);
    //  return;
    //}

    // admin - 0, evaluator -1, guest - 2
    const managerViewByMethod = getMethodManagerView(
      test.value.testType,
      test.value.subType,
    )
    const managerRoute = router.resolve({
      name: managerViewByMethod,
      params: { id: test.value.id },
    })

    const path =
      guest.accessLevel == 0
        ? managerRoute.href
        : `/testview/${test.value.id}/${guest.userDocId}`

    const payload = {
      userId: guest.userDocId,
      author: test.value.testAdmin.email,
      testId: test.value.id,
      redirectsTo: path,
      type: 'Collaboration',
      accessLevel: roleOptions.value.find((r) => r.value === guest.accessLevel)
        ?.value,
      titleTemplate: 'HeuristicsCooperators.actions.send_invitation',
    }

    if (customMessage) {
      payload.description = customMessage
    } else {
      payload.descriptionTemplate =
        'HeuristicsCooperators.messages.invite_message'
      payload.descriptionParams = { testTitle: test.value.testTitle || 'Test' }
    }

    await sendNotification(payload)
  }
}

const reinvite = async (guest) => {
  await sendMenssages(guest, guest?.inviteMessage ?? null)
}

const removeCoop = async (coop) => {
  confirmDialog.value = {
    show: true,
    title:
      t('HeuristicsCooperators.actions.remove_cooperator') ||
      'Remove Cooperator',
    subtitle:
      t('pages.settings.action_cannot_be_undone') ||
      'This action cannot be undone',
    message: t('HeuristicsCooperators.messages.remove_cooperator', {
      email: coop.email,
    }),
    confirmColor: 'error',
    confirmIcon: 'mdi-delete',
    icon: 'mdi-account-remove',
    iconColor: 'error',
    type: 'error',
    loading: false,
    action: 'removeCooperator',
    data: { coop },
  }
}

const executeCooperatorRemoval = async (coop) => {
  const index = cooperatorsEdit.value.findIndex(
    (c) =>
      (c.token && coop.token && c.token === coop.token) ||
      (c.userDocId && coop.userDocId && c.userDocId === coop.userDocId) ||
      (c.email && coop.email && c.email === coop.email),
  )
  if (index !== -1) {
    cooperatorsEdit.value.splice(index, 1)
  }
  test.value.cooperators = cooperatorsEdit.value
  await store.dispatch('updateStudy', test.value)
  await store.dispatch('removeTestFromCooperator', {
    test: test.value,
    cooperator: coop,
  })
}

const cancelInvitation = async (guest) => {
  confirmDialog.value = {
    show: true,
    title:
      t('HeuristicsCooperators.actions.cancel_invitation') ||
      'Cancel Invitation',
    subtitle:
      t('pages.settings.action_cannot_be_undone') ||
      'This action cannot be undone',
    message: t('HeuristicsCooperators.messages.cancel_invitation', {
      email: guest.email,
    }),
    confirmColor: 'warning',
    confirmIcon: 'mdi-cancel',
    icon: 'mdi-email-remove',
    iconColor: 'warning',
    type: 'warning',
    loading: false,
    action: 'cancelInvitation',
    data: { guest },
  }
}

const executeInvitationCancellation = async (guest) => {
  const index = cooperatorsEdit.value.findIndex(
    (c) =>
      (c.token && guest.token && c.token === guest.token) ||
      (c.userDocId && guest.userDocId && c.userDocId === guest.userDocId) ||
      (c.email && guest.email && c.email === guest.email),
  )
  if (index !== -1) {
    cooperatorsEdit.value.splice(index, 1)
  }
  test.value.cooperators = cooperatorsEdit.value
  await store.dispatch('updateStudy', test.value)
}

watch(loading, (newVal) => {
  if (!newVal) {
    showIntroComponent.value = cooperatorsEdit.value.length === 0
  }
})

onMounted(async () => {
  const testId = props.id || route.params.id

  if (testId) {
    try {
      await store.dispatch('getStudy', { id: testId })
    } catch (error) {
      return error
    }
  }
})
</script>

<style scoped>
.cooperators-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.cooperators-table :deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-grey-50));
}

.cooperators-table :deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 2px solid rgb(var(--v-theme-grey-200));
}

.cooperators-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.cooperators-table :deep(.v-selection-control) {
  justify-content: center;
}
</style>
