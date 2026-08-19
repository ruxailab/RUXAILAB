<template>
  <PageWrapper
    :title="!showIntroView ? $t('HeuristicsCooperators.title.cooperators') : ''"
  >
    <!-- Actions Slot -->
    <template v-if="!showIntroView && canManageCooperators" #actions>
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
      :role-options="supportedRoleOptions"
      :assignable-role-options="assignableRoleOptions"
      :can-change-role="canChangeRole"
      :can-remove="canRemoveCooperator"
      :can-cancel-invitation="canCancelCooperatorInvitation"
      :show-actions="canManageCooperators"
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
      :users="users"
      :role-options="assignableRoleOptions"
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
      :loading="loading"
      @send-invitations="handleSendInvitations"
    />

    <!-- Generate Invite Link -->
    <GenerateInviteLinkDialog
      v-model:show="showLinkInviteDialog"
      :study-id="test?.id"
      :study-title="test?.testTitle"
      :required-login="true"
      :membership-type="'cooperator'"
      :role-options="assignableRoleOptions"
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
                assignableRoleOptions.find(
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
                  assignableRoleOptions.find(
                    (r) => r.value === roleDialog.item?.accessLevel,
                  )?.title,
                )
              }}
            </v-icon>

            {{
              assignableRoleOptions.find(
                (r) => r.value === roleDialog.item?.accessLevel,
              )?.title
            }}
          </v-chip>

          <v-icon class="mx-2">mdi-arrow-right</v-icon>

          <v-select
            v-model="roleDialog.newRole"
            :items="
              assignableRoleOptions.filter(
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
import { ref, computed, onMounted } from 'vue'
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
import { useCooperatorUtils } from '@/shared/composables/useCooperatorUtils'
import { useRouter, useRoute } from 'vue-router'
import Notification from '@/shared/models/Notification'
import { useI18n } from 'vue-i18n'
import { showSuccess, showError, showWarning } from '@/shared/utils/toast'
import {
  canManageCooperator,
  getAssignableRoleOptions,
  getSupportedRoleOptions,
  hasStudyCapability,
  STUDY_CAPABILITY,
  MEMBERSHIP_STATUS,
} from '@/shared/utils/studyAccessPolicy'
import { manageStudyMembership } from '@/shared/services/studyMembershipService'
import { STUDY_ROLE } from '../utils/studyAccessPolicy'

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

const { getRoleColor, getRoleIcon } = useCooperatorUtils()

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

/**
 * New memberships use `status`.
 *
 * Legacy memberships do not have `status` and still rely on `accepted`.
 * These helpers preserve compatibility with both data structures.
 */
const isPendingCooperator = (cooperator) =>
  cooperator?.status === MEMBERSHIP_STATUS.PENDING ||
  (!cooperator?.status && cooperator?.accepted !== true)

const isAcceptedCooperator = (cooperator) =>
  cooperator?.status === MEMBERSHIP_STATUS.ACCEPTED ||
  (!cooperator?.status && cooperator?.accepted === true)

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
      `Failed to ${
        action === 'changeRole'
          ? 'update role'
          : action === 'removeCooperator'
            ? 'remove cooperator'
            : 'cancel invitation'
      }.`,
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
  inviteToken,
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
    inviteToken,
  })

  await store.dispatch('addNotification', {
    userId,
    notification,
  })

  return true
}

const showIntroComponent = ref(true)
const verified = ref(false)
const messageModel = ref(false)
const selectedUser = ref([])
const showInviteDialog = ref(false)
const showLinkInviteDialog = ref(false)
const drawerOpen = ref(false)

const dialog = computed(() => store.getters.getDialogLeaveStatus)
const test = computed(() => store.getters.test)
const userAuth = computed(() => store.getters.user)
const users = computed(() => store.state.Users?.users || [])

const cooperatorsEdit = computed(() =>
  test.value?.cooperators ? [...test.value.cooperators] : [],
)

const showIntroView = computed(() => {
  return cooperatorsEdit.value.length <= 0 && showIntroComponent.value
})

const loading = computed(() => store.getters.loading)

const supportedRoleOptions = computed(() => getSupportedRoleOptions(test.value))

const assignableRoleOptions = computed(() =>
  getAssignableRoleOptions(test.value, userAuth.value).filter(
    ({ value }) => value !== STUDY_ROLE.USER && value !== STUDY_ROLE.EVALUATOR,
  ),
)

const canManageCooperators = computed(() =>
  hasStudyCapability(
    test.value,
    userAuth.value,
    STUDY_CAPABILITY.COOPERATORS_INVITE,
  ),
)

/**
 * Role changes are allowed for accepted members and pending invitations.
 *
 * This preserves the previous behavior, where invited cooperators could
 * still have their role changed before accepting the invitation.
 */
const canChangeRole = (cooperator) => {
  if (!isAcceptedCooperator(cooperator) && !isPendingCooperator(cooperator)) {
    return false
  }

  return assignableRoleOptions.value.some((role) =>
    canManageCooperator(test.value, userAuth.value, cooperator, {
      action: 'assignRole',
      role: role.value,
    }),
  )
}

const canRemoveCooperator = (cooperator) => {
  if (!isAcceptedCooperator(cooperator)) {
    return false
  }

  return canManageCooperator(test.value, userAuth.value, cooperator, {
    action: 'remove',
  })
}

const canCancelCooperatorInvitation = (cooperator) => {
  return canManageCooperator(test.value, userAuth.value, cooperator, {
    action: 'cancelInvitation',
  })
}

const openMessageDialog = (item) => {
  if (!canManageCooperators.value) {
    showError('AccessNotAllowed.noAccess')
    return
  }

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
        title,
        author,
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

const handleSendInvitations = async ({
  selectedCoops,
  selectedRole,
  inviteMessage,
}) => {
  try {
    showInviteDialog.value = false
    const newInvites = await store.dispatch('sendInvitations', {
      study: test.value,
      user: userAuth.value,
      selectedCoops,
      selectedRole,
      inviteMessage,
      users: users.value,
      router,
      resolveUserByEmail,
    })

    await store.dispatch('getStudy', {
      id: test.value.id,
    })

    if (newInvites.length > 0) {
      showSuccess(
        t('cooperators.inviteSent', {
          users: newInvites.map((guest) => guest.email).join(', '),
        }),
      )
    }
  } catch {
    showError('errors.sendError')
  }
}

const changeRole = (item) => {
  roleDialog.value = {
    item,
    newRole: assignableRoleOptions.value.find(
      (r) => r.value !== item.accessLevel,
    ),
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
  if (
    !canManageCooperator(test.value, userAuth.value, item, {
      action: 'assignRole',
      role: newValue.value,
    })
  ) {
    showError('AccessNotAllowed.noAccess')
    return
  }

  await manageStudyMembership({
    studyId: test.value.id,
    action: 'assignRole',
    targetUserId: item.userDocId || null,
    targetEmail: item.email,
    role: newValue.value,
  })

  await store.dispatch('getStudy', {
    id: test.value.id,
  })
}

const reinvite = async (guest) => {
  try {
    await store.dispatch('reinviteCooperator', {
      study: test.value,
      user: userAuth.value,
      guest,
      router,
      resolveUserByEmail,
    })

    showSuccess('pages.cooperators.invitationSent')
  } catch {
    showError('errors.sendError')
  }
}

const removeCoop = async (coop) => {
  if (!canRemoveCooperator(coop)) {
    showError('AccessNotAllowed.noAccess')
    return
  }

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
  if (!canRemoveCooperator(coop)) {
    throw new Error('STUDY_ROLE_FORBIDDEN')
  }

  await manageStudyMembership({
    studyId: test.value.id,
    action: 'remove',
    targetUserId: coop.userDocId || null,
    targetEmail: coop.email,
  })

  await store.dispatch('getStudy', {
    id: test.value.id,
  })
}

const cancelInvitation = async (guest) => {
  if (!canCancelCooperatorInvitation(guest)) {
    showError('AccessNotAllowed.noAccess')
    return
  }

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
  if (!canCancelCooperatorInvitation(guest)) {
    throw new Error('STUDY_ROLE_FORBIDDEN')
  }

  await manageStudyMembership({
    studyId: test.value.id,
    action: 'cancelInvitation',
    targetUserId: guest.userDocId || null,
    targetEmail: guest.email,
  })

  await store.dispatch('getStudy', {
    id: test.value.id,
  })
}

onMounted(async () => {
  const testId = props.id || route.params.id

  if (testId) {
    try {
      await store.dispatch('getStudy', {
        id: testId,
      })
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
