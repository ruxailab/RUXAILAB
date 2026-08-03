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

    const result = await store.dispatch('acceptInvite', {
      token: token.value,
      user: user.value,
      studyId: invite.value.studyId,
      membershipType: invite.value.membershipType,
    })

    dialogHandled.value = true
    show.value = false

    router.push({
      name: 'TestView',
      params: {
        id: result.study.id,
      },
    })
  } finally {
    loading.value = false
  }
}

const reject = async () => {
  try {
    await store.dispatch('rejectInvite', {
      user: user.value,
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
