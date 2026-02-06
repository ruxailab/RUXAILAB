<template>
  <PageWrapper
    :title="!showIntroView ? $t('HeuristicsCooperators.title.cooperators') : ''"
  >
    <!-- Actions Slot -->
    <template v-if="!showIntroView" #actions>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-account-plus"
        variant="flat"
        class="px-6"
        @click="openDialog()"
      >
        {{ $t('HeuristicsCooperators.actions.send_invitation') }}
      </v-btn>
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
      :users="users"
      :show-date-time-selection="false"
      :title="$t('HeuristicsCooperators.actions.send_invitation')"
      :select-label="$t('HeuristicsCooperators.actions.select_cooperator')"
      :no-data-text="$t('HeuristicsCooperators.messages.no_users')"
      :role-label="$t('HeuristicsCooperators.headers.role')"
      :cancel-text="$t('HeuristicsCooperators.actions.cancel')"
      :send-text="$t('HeuristicsCooperators.actions.send')"
      @send-invitations="handleSendInvitations"
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
import { ref, computed, watch, onMounted, useSlots } from 'vue'
import { useStore } from 'vuex'
import Intro from '@/shared/components/introduction_cards/IntroCoops.vue'
import AccessNotAllowed from '@/shared/views/AccessNotAllowed.vue'
import LeaveAlert from '@/shared/components/dialogs/LeaveAlert.vue'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import CooperatorTable from '@/shared/components/CooperatorTable.vue'
import MessageDialog from '@/shared/components/dialogs/MessageDialog.vue'
import InviteDialog from '@/shared/components/dialogs/InviteDialog.vue'
import UIDGenerator from 'uid-generator'
import { useCooperatorUtils } from '@/shared/composables/useCooperatorUtils'
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

const emit = defineEmits(['open-invite-dialog'])

const store = useStore()
const route = useRoute()
const slots = useSlots()
const { t } = useI18n()

const { roleOptions } = useCooperatorUtils()

const {
  handleRoleChange,
  handleCooperatorRemoval,
  handleInvitationCancellation,
} = useCooperatorActions()

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
const drawerOpen = ref(false)

const showIntroView = computed(() => {
  return cooperatorsEdit.value.length <= 0 && showIntroComponent.value
})

const dialog = computed(() => store.getters.getDialogLeaveStatus)
const test = computed(() => store.getters.test)
const userAuth = computed(() => store.getters.user)
const users = computed(() => store.state.Users?.users || [])
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
    } catch (error) {
      showError('HeuristicsCooperators.messages.message_sent_error')
    }
  } else {
    showWarning('HeuristicsCooperators.messages.user_not_registered')
  }
}

const handleSendEmail = async (guest) => {
  const emailController = new EmailController()
  await emailController.send({
    to: guest.email,
    subject: t('HeuristicsCooperators.actions.send_invitation'),
    attachments: [],
    template: 'invite',
    data: {
      message: inviteMessages.value || '',
      testTitle: test.value.testTitle,
      testDescription: test.value.testDescription,
      adminEmail: test.value.testAdmin.email,
      adminName: userAuth.value.name || userAuth.value.email,
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

  selectedCoops.forEach((coop) => {
    const coopEmail = coop.email || coop // Handle both object and string formats
    
    // Check if this email already exists in cooperators list
    const existingIndex = cooperatorsEdit.value.findIndex(
      (c) => c.email === coopEmail
    )

    if (existingIndex === -1) {
      // New email - create new cooperator entry
      const token = uidgen.generateSync()
      if (!coop.id) {
        cooperatorsEdit.value.push({
          userDocId: null,
          email: coop,
          invited: true,
          accepted: false,
          accessLevel: roleOptions.value[selectedRole].value,
          token,
          progress: 0,
          updateDate: test.value?.updateDate || new Date().toISOString(),
          testAuthorEmail: test.value?.testAdmin?.email || '',
        })
      } else {
        cooperatorsEdit.value.push({
          userDocId: coop.id,
          email: coop.email,
          invited: true,
          accepted: false,
          accessLevel: roleOptions.value[selectedRole].value,
          token,
          progress: 0,
          updateDate: test.value?.updateDate || new Date().toISOString(),
          testAuthorEmail: test.value?.testAdmin?.email || '',
        })
      }
      tokens[coop.id || coop] = token
      newInvites.push(coopEmail)
    } else {
      // Email already exists - update their role instead of creating duplicate
      const existing = cooperatorsEdit.value[existingIndex]
      const newRole = roleOptions.value[selectedRole].value
      
      if (existing.accessLevel !== newRole) {
        // Update the existing entry's role
        cooperatorsEdit.value[existingIndex] = {
          ...existing,
          accessLevel: newRole,
          updateDate: new Date().toISOString(),
        }
        updatedRoles.push(coopEmail)
      }
      // Keep existing token so their invite link still works
      tokens[coop.id || coop] = existing.token
    }
  })

  await submit()
  showInviteDialog.value = false

  // Show appropriate feedback
  if (updatedRoles.length > 0) {
    showSuccess(t('cooperators.updatedRole', { 
      role: roleOptions.value[selectedRole].title, 
      users: updatedRoles.join(', ') 
    }))
  }
  if (newInvites.length > 0) {
    showSuccess(t('cooperators.inviteSent', { users: newInvites.join(', ') }))
  }
}

const changeRole = async (item, newValue) => {
  await handleRoleChange(
    item,
    newValue,
    roleOptions.value,
    async (item, newValue) => {
      const index = cooperatorsEdit.value.indexOf(item)
      const newCoop = { ...item, accessLevel: newValue.value }
      test.value.cooperators[index] = newCoop
      await store.dispatch('updateStudy', test.value)
      await store.dispatch('updateUserAnswer', {
        testDocId: test.value.id,
        cooperatorId: newCoop.userDocId,
        data: { accessLevel: newCoop.accessLevel },
      })
    },
  )
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
      ...newCooperators.map((guest) => sendMenssages(guest)),
    ])
  } catch (error) {
    console.error('Error updating study:', error)
  }
}

const sendMenssages = async (guest) => {
  try {
    await notifyCooperator(guest)
    // Email is optional - don't let it block the notification
    try {
      await handleSendEmail(guest)
    } catch (emailError) {
      console.warn('Email sending failed (may be missing VUE_APP_CLOUD_FUNCTIONS_URL):', emailError.message)
    }
    showSuccess('pages.cooperators.invitationSent')
  } catch (error) {
    console.error('sendMenssages error:', error)
    showError('errors.sendError')
    return error
  }
}

const notifyCooperatorAccessibility = async (guest) => {
  if (test.value) {
    const isManual = test.value.testType === 'MANUAL'
    const methodPath = isManual ? 'manual' : 'automatic'
    const methodLabel = isManual ? 'manual_testing' : 'automatic_testing'
    
    const path = `accessibility/${methodPath}/preview/${test.value.id}`
    const author = test.value.testAdmin.email

    const payload = {
      userId: guest.userDocId,
      author,
      redirectsTo: path,
      testId: test.value.id,
      titleTemplate: 'HeuristicsCooperators.actions.send_invitation',
    }

    if (inviteMessages.value) {
      payload.description = inviteMessages.value
    } else {
      payload.descriptionTemplate = 'HeuristicsCooperators.messages.invite_message'
      payload.descriptionParams = { testTitle: test.value.testTitle || 'Test' }
    }

    await sendNotification(payload)
  }
}

const notifyCooperator = async (guest) => {
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
      accessLevel: roleOptions.value.find((r) => r.value === guest.accessLevel)?.value,
      titleTemplate: 'HeuristicsCooperators.actions.send_invitation',
    }

    if (inviteMessages.value) {
      payload.description = inviteMessages.value
    } else {
      payload.descriptionTemplate = 'HeuristicsCooperators.messages.invite_message'
      payload.descriptionParams = { testTitle: test.value.testTitle || 'Test' }
    }

    await sendNotification(payload)
  }
}

const reinvite = async (guest) => {
  await sendMenssages(guest)
}

const removeCoop = async (coop) => {
  await handleCooperatorRemoval(coop, async (coop) => {
    const index = cooperatorsEdit.value.indexOf(coop)
    cooperatorsEdit.value.splice(index, 1)
    test.value.cooperators = cooperatorsEdit.value
    await store.dispatch('updateStudy', test.value)
    await store.dispatch('removeTestFromCooperator', {
      test: test.value,
      cooperator: coop,
    })
  })
}

const cancelInvitation = async (guest) => {
  await handleInvitationCancellation(guest, async (guest) => {
    const index = cooperatorsEdit.value.indexOf(guest)
    cooperatorsEdit.value.splice(index, 1)
    test.value.cooperators = cooperatorsEdit.value
    await store.dispatch('updateStudy', test.value)
  })
}

const openDialog = async () => {
  if (slots.dialog) drawerOpen.value = true
  else showInviteDialog.value = true
}

watch(loading, (newVal) => {
  if (!newVal) {
    showIntroComponent.value = cooperatorsEdit.value.length === 0
  }
})

onMounted(async () => {
  store.dispatch('getAllUsers')

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
