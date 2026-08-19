<template>
  <PageWrapper
    :title="!showIntroView ? $t('Participants.title.participants') : ''"
  >
    <!-- Actions Slot -->
    <template v-if="!showIntroView && canManageParticipants" #actions>
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
            {{ $t('Participants.actions.invite_participant') }}
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            prepend-icon="mdi-email-outline"
            @click="showInviteDialog = true"
          >
            <v-list-item-title>
              {{ $t('Participants.invite.byEmail') }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            prepend-icon="mdi-link-variant"
            @click="showLinkInviteDialog = true"
          >
            <v-list-item-title>
              {{ $t('Participants.invite.generateLink') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- Subtitle Slot -->
    <template v-if="!showIntroView" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('Participants.subtitles.manage_participants') }}
      </p>
    </template>

    <Intro v-if="showIntroView" @close-intro="showIntroComponent = false" />

    <ParticipantTable
      v-else
      :participants="participants"
      :loading="loading"
      :show-date-columns="showDateColumns"
      :show-session-column="showSessionColumn"
      :show-actions="canManageParticipants"
      :can-remove="canRemoveParticipant"
      :can-cancel-invitation="true"
      :message-text="$t('Participants.actions.send_message')"
      :reinvite-text="$t('Participants.actions.reinvite')"
      :remove-text="$t('Participants.actions.remove_participant')"
      :cancel-text="$t('Participants.actions.cancel_invitation')"
      @send-message="openMessageDialog"
      @reinvite="reinviteParticipant"
      @remove-participant="removeParticipant"
      @cancel-invitation="cancelParticipantInvitation"
    />

    <!-- Leave Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <LeaveAlert />
    </v-dialog>

    <!-- Message Dialog -->
    <MessageDialog
      v-model:show="messageModel"
      :selected-user="selectedUser"
      :title="$t('Participants.actions.send_message')"
      :title-label="$t('Participants.headers.title')"
      :title-hint="$t('Participants.messages.message_title_hint')"
      :content-label="$t('Participants.headers.content')"
      :content-hint="$t('Participants.messages.message_content_hint')"
      :cancel-text="$t('Participants.actions.cancel')"
      :send-text="$t('Participants.actions.send')"
      @send-message="handleSendMessage"
    />

    <!-- Invite Dialog -->
    <InviteDialog
      v-model:show="showInviteDialog"
      :users="users"
      :role-options="null"
      :pre-defined-role="preDefinedRole"
      :existing-cooperators="participants"
      :current-user-email="userAuth?.email"
      :study-owner-email="test?.testAdmin?.email"
      :show-date-time-selection="false"
      :title="$t('Participants.actions.invite_participant')"
      :select-label="$t('Participants.actions.select_participant')"
      :no-data-text="$t('Participants.messages.no_users')"
      :cancel-text="$t('Participants.actions.cancel')"
      :send-text="$t('Participants.actions.send')"
      :loading="loading"
      @send-invitations="handleSendInvitations"
    />

    <!-- Generate Invite Link -->
    <GenerateInviteLinkDialog
      v-model:show="showLinkInviteDialog"
      :study-id="test?.id"
      :study-title="test?.testTitle"
      :required-login="requiredLoginOption"
      :pre-defined-role="preDefinedRole"
      :membership-type="'participant'"
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
    />

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
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showSuccess, showError, showWarning } from '@/shared/utils/toast'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import Intro from '@/shared/components/introduction_cards/IntroParticipants.vue'
import AccessNotAllowed from '@/shared/views/AccessNotAllowed.vue'
import LeaveAlert from '@/shared/components/dialogs/LeaveAlert.vue'
import MessageDialog from '@/shared/components/dialogs/MessageDialog.vue'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'
import GenerateInviteLinkDialog from '@/shared/components/dialogs/GenerateInviteLinkDialog.vue'
import ParticipantTable from '@/shared/components/tables/ParticipantTable.vue'
import InviteDialog from '@/shared/components/dialogs/InviteDialog.vue'
import {
  getPredefinedParticipantUserRole,
  getRequiredLoginConfig,
} from '@/shared/composables/useCooperatorUtils'
import Notification from '@/shared/models/Notification'

const router = useRouter()
const route = useRoute()
const store = useStore()
const { t } = useI18n()

const props = defineProps({
  id: {
    type: String,
    default: '',
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

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const showIntroComponent = ref(true)
const verified = ref(false)

const messageModel = ref(false)
const selectedUser = ref(null)

const showInviteDialog = ref(false)
const showLinkInviteDialog = ref(false)

const drawerOpen = ref(false)

/*
|--------------------------------------------------------------------------
| Confirmation Dialog
|--------------------------------------------------------------------------
*/

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
}

const handleConfirmAction = async () => {
  if (!confirmDialog.value.action) {
    return
  }

  confirmDialog.value.loading = true

  try {
    await confirmDialog.value.action(confirmDialog.value.data)

    // showSuccess('success')

    resetConfirmDialog()
  } catch {
    showError('errors.sendError')

    confirmDialog.value.loading = false
  }
}

const handleCancelAction = () => {
  resetConfirmDialog()
}

/*
|--------------------------------------------------------------------------
| Store
|--------------------------------------------------------------------------
*/

const test = computed(() => store.getters.test)

const userAuth = computed(() => store.getters.user)

const users = computed(() => store.state.Users?.users || [])

const loading = computed(() => store.getters.loading)

const dialog = computed(() => store.getters.getDialogLeaveStatus)

const preDefinedRole = computed(() =>
  getPredefinedParticipantUserRole(test.value),
)

const requiredLoginOption = computed(() => getRequiredLoginConfig(test.value))

const participants = computed(() => store.getters.participants)

const showIntroView = computed(() => {
  return participants.value.length <= 0 && showIntroComponent.value
})

/*
|--------------------------------------------------------------------------
| Permissions
|--------------------------------------------------------------------------
*/

const canManageParticipants = computed(() => {
  /*
   * Será conectado à policy de participants
   * na próxima etapa.
   */

  return true
})

/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

const openMessageDialog = (participant) => {
  selectedUser.value = participant
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

const handleSendInvitations = async ({
  selectedCoops,
  selectedRole,
  inviteMessage,
}) => {
  try {
    showInviteDialog.value = false
    showIntroComponent.value = false

    const newInvites = await store.dispatch('sendParticipantInvitations', {
      study: test.value,
      user: userAuth.value,
      selectedParticipants: selectedCoops,
      selectedRole,
      inviteMessage,
      users: users.value,
      router,
      resolveUserByEmail,
      studyParticipants: participants.value,
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

const reinviteParticipant = async (participant) => {
  try {
    await store.dispatch('reinviteParticipant', {
      study: test.value,
      user: userAuth.value,
      participant,
      router,
      resolveUserByEmail,
    })

    showSuccess('pages.cooperators.invitationSent')
  } catch {
    showError('errors.sendError')
  }
}

const removeParticipant = (participant) => {
  confirmDialog.value = {
    show: true,
    title: t('Participants.actions.remove_participant'),
    subtitle: '',
    message: t('Participants.messages.remove_participant_confirmation', {
      email: participant.email,
    }),
    confirmColor: 'error',
    confirmIcon: 'mdi-account-remove',
    icon: 'mdi-alert-circle-outline',
    iconColor: 'warning',
    type: 'warning',
    loading: false,
    action: async (selectedParticipant) => {
      await store.dispatch('removeParticipant', {
        study: test.value,
        user: userAuth.value,
        participant: selectedParticipant,
      })
    },
    data: participant,
  }
}

const cancelParticipantInvitation = (participant) => {
  confirmDialog.value = {
    show: true,
    title: t('Participants.actions.cancel_invitation'),
    subtitle: '',
    message: t('Participants.messages.cancel_invitation_confirmation', {
      email: participant.email,
    }),
    confirmColor: 'error',
    confirmIcon: 'mdi-close-circle-outline',
    icon: 'mdi-alert-circle-outline',
    iconColor: 'warning',
    type: 'warning',
    loading: false,
    action: async (selectedParticipant) => {
      await store.dispatch('cancelParticipantInvitation', {
        study: test.value,
        user: userAuth.value,
        participant: selectedParticipant,
      })
    },
    data: participant,
  }
}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

watch(loading, (newValue) => {
  if (!newValue) {
    showIntroComponent.value = participants.value.length === 0
  }
})

onMounted(async () => {
  const studyId = props.id || route.params.id

  if (!studyId) {
    return
  }

  await store.dispatch('getStudy', {
    id: studyId,
  })

  await store.dispatch('getStudyParticipants', { studyId })
})
</script>
