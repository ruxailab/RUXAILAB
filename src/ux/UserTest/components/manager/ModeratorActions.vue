<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center pb-2">
      <v-icon class="mr-2" color="primary">mdi-account-supervisor</v-icon>
      Moderator Actions
    </v-card-title>

    <v-card-text class="pa-4">
      <div class="d-flex flex-column gap-3">
        <v-btn color="primary" variant="outlined" block @click="startSession">
          <v-icon start>mdi-play</v-icon>
          Start Session
        </v-btn>

        <v-btn
          color="success"
          variant="outlined"
          block
          @click="scheduleSession"
        >
          <v-icon start>mdi-calendar-plus</v-icon>
          Schedule Session
        </v-btn>

        <v-btn color="info" variant="outlined" block @click="viewSessions">
          <v-icon start>mdi-calendar-check</v-icon>
          View Sessions
        </v-btn>

        <v-btn color="warning" variant="outlined" block @click="editTest">
          <v-icon start>mdi-pencil</v-icon>
          Edit Test
        </v-btn>

        <v-btn color="orange" variant="outlined" block @click="moderatorGuide">
          <v-icon start>mdi-book-open-variant</v-icon>
          Moderator Guide
        </v-btn>

        <v-btn
          v-if="test.status === 'active'"
          color="error"
          variant="outlined"
          block
          @click="pauseTest"
        >
          <v-icon start>mdi-pause</v-icon>
          Pause Test
        </v-btn>

        <v-btn
          v-else-if="test.status === 'paused'"
          color="success"
          variant="outlined"
          block
          @click="resumeTest"
        >
          <v-icon start>mdi-play</v-icon>
          Resume Test
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const props = defineProps({
  test: {
    type: Object,
    default: () => ({}),
  },
})

const router = useRouter()
const store = useStore()

const startSession = () => {
  const currentUser = store.getters.user
  router.push(`/testview/${props.test.id}/${currentUser.id}`)
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
    message: 'Moderator guide will be available soon!',
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
      message: 'Test paused successfully',
    })
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to pause test',
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
      message: 'Test resumed successfully',
    })
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to resume test',
    })
  }
}
</script>
