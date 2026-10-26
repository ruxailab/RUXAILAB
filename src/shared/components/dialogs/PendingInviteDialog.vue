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
import {
  getMethodManagerView,
  normalizeStudyType,
} from '@/shared/constants/methodDefinitions'
import { getInviteAcceptanceDestination } from '@/shared/utils/studyNavigation'
import { showError } from '@/shared/utils/toast'

const router = useRouter()
const store = useStore()

const show = ref(false)
const loading = ref(false)

const token = ref(null)
const invite = ref(null)

const dialogHandled = ref(false)

const user = computed(() => store.getters.user)

const acceptInvite = async () => {
  try {
    loading.value = true

    const notification = store.getters.notifications?.find(
      (item) => item.inviteToken === token.value && !item.read,
    )

    const result = await store.dispatch('acceptInvite', {
      token: token.value,
      user: user.value,
      studyId: invite.value.studyId,
      notification,
      membershipType: invite.value.membershipType,
    })

    dialogHandled.value = true
    show.value = false

    const testId = result.study.id

    if (invite.value.membershipType === 'participant') {
      const destination = getInviteAcceptanceDestination({
        study: result.study,
        user: user.value,
        membershipType: 'participant',
      })
      if (destination) await router.push(destination)

      return
    }

    const normalizedTestType = normalizeStudyType(result.study.testType)

    const methodView = getMethodManagerView(
      normalizedTestType,
      result.study.subType,
    )

    await router.push({
      name: methodView,
      params: {
        id: testId,
      },
    })
  } catch (error) {
    // Keep the dialog open so a failed acceptance is visible and retryable.
    showError(error?.message || 'errors.globalError')
  } finally {
    loading.value = false
  }
}

const reject = async () => {
  try {
    await store.dispatch('rejectInvite', {
      user: user.value,
      studyId: invite.value.studyId,
      membershipType: invite.value.membershipType,
    })
  } finally {
    dialogHandled.value = true
    show.value = false
  }
}

const dismiss = async () => {
  try {
    await store.dispatch('dismissInvite', {
      invite: invite.value,
      user: user.value,
      router,
    })
  } finally {
    dialogHandled.value = true
    show.value = false
  }
}

const loadPendingInvite = async () => {
  const pendingToken = localStorage.getItem('pendingInviteToken')

  if (!pendingToken) {
    return
  }

  token.value = pendingToken

  invite.value = await store.dispatch('loadPendingInvite', {
    token: pendingToken,
  })

  if (invite.value) {
    tryShowDialog()
  }
}

/**
 * Decide whether the dialog should be shown.
 */
const tryShowDialog = () => {
  if (!invite.value) {
    return
  }

  if (dialogHandled.value || show.value) {
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
   * Private invitations require an authenticated user.
   */
  if (!user.value) {
    return
  }

  const sameEmail =
    invite.value.email &&
    user.value.email &&
    invite.value.email.toLowerCase() === user.value.email.toLowerCase()

  if (sameEmail) {
    show.value = true
  }
}

onMounted(() => {
  loadPendingInvite()
})

watch(user, () => {
  tryShowDialog()
})
</script>
