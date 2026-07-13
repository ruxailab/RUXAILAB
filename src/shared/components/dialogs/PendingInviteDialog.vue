<template>
  <ConfirmDialog
    :show="show"
    :title="$t('invite.pendingTitle')"
    :subtitle="`${$t('invite.pendingSubtitle')}: ${invite?.studyTitle ?? ''}`"
    :message="$t('invite.pendingDescription')"
    :confirm-text="$t('invite.accept')"
    :cancel-text="$t('acceptInvitation.reject')"
    :third-text="$t('invite.notNow')"
    confirm-color="primary"
    confirm-icon="mdi-check"
    icon="mdi-email-outline"
    icon-color="primary"
    type="info"
    :loading="loading"
    @update:show="show = $event"
    @confirm="acceptInvite"
    @cancel="reject"
    @third="dismiss"
  />
</template>
<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'
import InviteController from '@/shared/controllers/InviteController.js'
import StudyController from '@/controllers/StudyController'
import Notification from '@/shared/models/Notification'
import { getMethodManagerView } from '@/shared/constants/methodDefinitions'

const router = useRouter()
const store = useStore()

const show = ref(false)
const loading = ref(false)

const token = ref(null)
const invite = ref(null)

const inviteValidated = ref(false)
const dialogHandled = ref(false)

const user = computed(() => store.getters.user)

const acceptInvite = async () => {
  try {
    loading.value = true

    const result = await InviteController.resolveInvite(
      token.value,
      user.value.id,
    )

    const study = await new StudyController().getStudy({
      id: result.invite.studyId,
    })

    await store.dispatch('acceptStudyCollaboration', {
      test: study,
      cooperator: user.value,
    })

    localStorage.removeItem('pendingInviteToken')

    dialogHandled.value = true
    show.value = false

    router.push({
      name: 'TestView',
      params: {
        id: result.invite.studyId,
      },
    })
  } finally {
    loading.value = false
  }
}

const reject = async () => {
  try {
    await store.dispatch('markNotificationAsRead', {
      notification,
      user: user.value,
    })

    // remove possible invite token from localStorage
    localStorage.removeItem('pendingInviteToken')
  } finally {
    dialogHandled.value = true
    show.value = false
  }
}

const dismiss = async () => {
  try {
    await sendInviteNotification()
  } finally {
    dialogHandled.value = true
    show.value = false
  }
}

const sendInviteNotification = async () => {
  const study = await new StudyController().getStudy({
    id: invite.value.studyId,
  })

  const managerViewByMethod = getMethodManagerView(
    study.testType,
    study.subType,
  )

  const managerRoute = router.resolve({
    name: managerViewByMethod,
    params: { id: study.id },
  })

  const redirectsTo =
    invite.value.accessLevel === 0
      ? managerRoute.href
      : `/testview/${study.id}/${user.value.id}`

  const notifications = user.value?.notifications || []

  const alreadyExists = notifications.some(
    (notification) =>
      !notification.read &&
      notification.type === 'Collaboration' &&
      notification.testId === study.id &&
      notification.redirectsTo === redirectsTo,
  )

  if (alreadyExists) {
    localStorage.removeItem('pendingInviteToken')
    return
  }

  const notification = new Notification({
    author: study.testAdmin.email,
    read: false,
    testId: study.id,
    redirectsTo,
    type: 'Collaboration',
    accessLevel: invite.value.accessLevel,
    titleTemplate: 'HeuristicsCooperators.actions.send_invitation',
    descriptionTemplate: 'HeuristicsCooperators.messages.invite_message',
    descriptionParams: {
      testTitle: study.testTitle || 'Study',
    },
  })

  await store.dispatch('addNotification', {
    userId: user.value.id,
    notification,
  })

  localStorage.removeItem('pendingInviteToken')
}

/**
 * Validate the token only once.
 */
const validatePendingInvite = async () => {
  token.value = localStorage.getItem('pendingInviteToken')

  if (!token.value) {
    return
  }

  try {
    const result = await InviteController.validateInvite(token.value)

    if (!result.valid) {
      localStorage.removeItem('pendingInviteToken')
      return
    }

    invite.value = result.invite
    inviteValidated.value = true

    tryShowDialog()
  } catch {
    localStorage.removeItem('pendingInviteToken')
  }
}

/**
 * Decide whether the dialog should be shown.
 */
const tryShowDialog = () => {
  if (!inviteValidated.value) {
    return
  }

  if (dialogHandled.value) {
    return
  }

  if (show.value) {
    return
  }

  /**
   * Public invitations are shown to anyone.
   */
  if (invite.value.isPublic) {
    show.value = true
    return
  }

  /**
   * Wait until authentication is restored.
   */
  if (!user.value) {
    return
  }

  /**
   * Private invitations.
   */
  if (
    invite.value.email &&
    user.value.email &&
    invite.value.email.toLowerCase() === user.value.email.toLowerCase()
  ) {
    show.value = true
  }
}

onMounted(() => {
  validatePendingInvite()
})

watch(user, () => {
  tryShowDialog()
})
</script>
