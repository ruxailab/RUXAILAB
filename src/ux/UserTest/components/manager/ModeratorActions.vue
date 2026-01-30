<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center pb-2">
      <v-icon class="mr-2" color="primary">mdi-account-supervisor</v-icon>
      {{ t('UserTestView.moderatorActions.title') }}
    </v-card-title>

    <v-card-text class="pa-4">
      <div class="d-flex flex-column gap-3">
        <v-btn color="primary" variant="outlined" block @click="startSession">
          <v-icon start>mdi-play</v-icon>
          {{ t('UserTestView.moderatorActions.startSession') }}
        </v-btn>

        <v-btn
          color="success"
          variant="outlined"
          block
          @click="scheduleSession"
        >
          <v-icon start>mdi-calendar-plus</v-icon>
          {{ t('UserTestView.moderatorActions.scheduleSession') }}
        </v-btn>

        <v-btn color="info" variant="outlined" block @click="viewSessions">
          <v-icon start>mdi-calendar-check</v-icon>
          {{ t('UserTestView.moderatorActions.viewSessions') }}
        </v-btn>

        <v-btn color="warning" variant="outlined" block @click="editTest">
          <v-icon start>mdi-pencil</v-icon>
          {{ t('UserTestView.moderatorActions.editTest') }}
        </v-btn>

        <v-btn color="orange" variant="outlined" block @click="moderatorGuide">
          <v-icon start>mdi-book-open-variant</v-icon>
          {{ t('UserTestView.moderatorActions.guide') }}
        </v-btn>

        <v-btn
          v-if="test.status === 'active'"
          color="error"
          variant="outlined"
          block
          @click="pauseTest"
        >
          <v-icon start>mdi-pause</v-icon>
          {{ t('UserTestView.moderatorActions.pauseTest') }}
        </v-btn>

        <v-btn
          v-else-if="test.status === 'paused'"
          color="success"
          variant="outlined"
          block
          @click="resumeTest"
        >
          <v-icon start>mdi-play</v-icon>
          {{ t('UserTestView.moderatorActions.resumeTest') }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  test: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const store = useStore()

const startSession = () => {
  router.push(`/userTest/moderated/session/${props.test.id}`)
}

const scheduleSession = () => {
  router.push(`/userTest/moderated/schedule/${props.test.id}`)
}

const viewSessions = () => {
  router.push(`/userTest/moderated/sessions/${props.test.id}`)
}

const editTest = () => {
  router.push(`/userTest/moderated/edit/${props.test.id}`)
}

const moderatorGuide = () => {
  // Open moderator guide or help documentation
  store.commit('SET_TOAST', {
    type: 'info',
    message: t('UserTestView.moderatorActions.guideInfo'),
  })
}

const pauseTest = async () => {
  try {
    await store.dispatch('updateTestStatus', {
      testId: props.test.id,
      status: 'paused',
    })
    store.commit('SET_TOAST', {
      type: 'success',
      message: t('UserTestView.moderatorActions.pauseSuccess'),
    })
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.moderatorActions.pauseError'),
    })
  }
}

const resumeTest = async () => {
  try {
    await store.dispatch('updateTestStatus', {
      testId: props.test.id,
      status: 'active',
    })
    store.commit('SET_TOAST', {
      type: 'success',
      message: t('UserTestView.moderatorActions.resumeSuccess'),
    })
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.moderatorActions.resumeError'),
    })
  }
}
</script>
