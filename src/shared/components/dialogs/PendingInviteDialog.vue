<template>
  <ConfirmDialog
    :show="show"
    :title="$t('invite.pendingTitle')"
    :subtitle="$t('invite.pendingSubtitle')"
    :message="$t('invite.pendingDescription')"
    :confirm-text="$t('invite.accept')"
    :cancel-text="$t('invite.notNow')"
    confirm-color="primary"
    confirm-icon="mdi-check"
    icon="mdi-email-outline"
    icon-color="primary"
    type="info"
    :loading="loading"
    @update:show="show = $event"
    @confirm="acceptInvite"
    @cancel="dismiss"
  />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ConfirmDialog from '@/shared/components/dialogs/ConfirmDialog.vue'
import InviteController from '@/shared/controllers/InviteController.js'
import StudyController from '@/controllers/StudyController'

const router = useRouter()
const store = useStore()

const show = ref(false)
const loading = ref(false)

const token = ref(null)
const invite = ref(null)

const user = computed(() => store.state.Auth.user)

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

const dismiss = () => {
  show.value = false
}

onMounted(async () => {
  token.value = localStorage.getItem('pendingInviteToken')

  if (!token.value) {
    return
  }

  const user = store.state.Auth.user

  if (!user) {
    return
  }

  try {
    const result = await InviteController.validateInvite(token.value)

    if (!result.valid) {
      localStorage.removeItem('pendingInviteToken')
      return
    }

    invite.value = result.invite
    /**
     * Public invitations can be shown to any authenticated user.
     */
    if (invite.value.isPublic) {
      show.value = true
      return
    }

    /**
     * Private invitations are only shown to the invited email.
     */
    if (
      invite.value.email &&
      user.email &&
      invite.value.email.toLowerCase() === user.email.toLowerCase()
    ) {
      show.value = true
      return
    }

    /**
     * Different account: keep the token so the user can switch accounts later.
     */
  } catch {
    localStorage.removeItem('pendingInviteToken')
  }
})
</script>
