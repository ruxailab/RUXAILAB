<template>
  <v-container v-if="invitation" class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h5">Study invitation</v-card-title>
          <v-card-text>
            <p class="text-h6 mb-2">{{ invitation.study.testTitle }}</p>
            <p class="mb-4">{{ invitation.study.testDescription }}</p>
            <p>
              Accept this invitation to access the private study with the
              assigned role.
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="accepting"
              @click="acceptInvitation"
            >
              Accept invitation
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <div v-else-if="test && !redirecting">
    <div v-if="test.testType == STUDY_TYPES.HEURISTIC">
      <HeuristicTestView :id="id" :token="token" />
    </div>
    <div
      v-if="
        test.testType == STUDY_TYPES.USER &&
        test.subType === USER_STUDY_SUBTYPES.UNMODERATED
      "
    >
      <UserTestView />
    </div>
    <div
      v-if="
        test.testType === STUDY_TYPES.USER &&
        test.subType === USER_STUDY_SUBTYPES.MODERATED
      "
    >
      <ModeratedTestView ref="moderatedTestViewRef" :token="token" />
    </div>
  </div>

  <v-container v-else class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <v-progress-circular
          v-if="loading"
          color="primary"
          indeterminate
          size="48"
        />
        <v-alert v-else-if="accessError" type="error" variant="tonal">
          {{ accessError }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import UserTestView from '@/ux/UserTest/views/UserTestView.vue'
import ModeratedTestView from '../../ux/UserTest/views/ModeratedTestView.vue'
import HeuristicTestView from '../../ux/Heuristic/views/HeuristicTestView.vue'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'
import {
  getStudyInvitation,
  manageStudyMembership,
} from '@/shared/services/studyMembershipService'
import {
  getAcceptedInvitationDestination,
  getTestViewAccessRedirect,
} from '@/shared/utils/studyNavigation'
import { canJoinModeratedUserSession } from '@/shared/utils/studyAccessPolicy'
import { showError } from '@/shared/utils/toast'

const props = defineProps({
  id: { type: String, default: '' },
  token: { type: String, default: null },
})

const store = useStore()
const router = useRouter()

const test = computed(() => {
  const currentTest = store.getters.test
  if (currentTest?.id === props.id || currentTest?.testDocId === props.id) {
    return currentTest
  }
  return null
})
const user = computed(() => store.getters.user)
const userId = computed(() => user.value?.id ?? user.value?.uid ?? null)
const moderatedTestViewRef = ref(null)
const invitation = ref(null)
const accepting = ref(false)
const loading = ref(true)
const redirecting = ref(false)
const accessError = ref('')

const ACCESS_ERROR_MESSAGE =
  "You do not have access to the page you're trying to access."

const redirectIfNeeded = async (destination) => {
  if (!destination || router.currentRoute.value.fullPath === destination) {
    return
  }

  redirecting.value = true
  await router.replace(destination)
}

const loadStudy = async () => {
  const loaded = await store.dispatch('getStudy', { id: props.id })
  if (loaded) await store.dispatch('getCurrentTestAnswerDoc')
  return loaded
}

const denyAccess = async (destination = '/admin') => {
  accessError.value = ACCESS_ERROR_MESSAGE
  showError('AccessNotAllowed.noAccess')
  await redirectIfNeeded(destination)
}

const handleLoadedStudy = async (loadedStudy) => {
  const destination = getTestViewAccessRedirect({
    study: loadedStudy,
    user: user.value,
    token: props.token,
  })

  if (!destination) return true

  if (destination === '/admin') {
    await denyAccess(destination)
    return false
  }

  await redirectIfNeeded(destination)
  return false
}

const shouldLoadInvitation = (loadedStudy = null) => {
  if (!props.token) return false
  if (props.token === userId.value) return false
  if (
    loadedStudy &&
    canJoinModeratedUserSession(loadedStudy, user.value, props.token)
  ) {
    return false
  }
  return true
}

const loadInvitation = async (loadedStudy = null) => {
  if (!shouldLoadInvitation(loadedStudy)) return false

  try {
    invitation.value = await getStudyInvitation({
      studyId: props.id,
      token: props.token,
    })
    return true
  } catch {
    return false
  }
}

const acceptInvitation = async () => {
  accepting.value = true
  try {
    await manageStudyMembership({ studyId: props.id, action: 'accept' })
    const acceptedStudy = await loadStudy()
    const destination = getAcceptedInvitationDestination({
      study: acceptedStudy || test.value,
      user: user.value,
    })
    if (destination) await router.replace(destination)
    invitation.value = null
  } catch (error) {
    showError(error?.message || 'Unable to accept this invitation.')
  } finally {
    accepting.value = false
  }
}

onBeforeMount(async () => {
  loading.value = true
  redirecting.value = false
  accessError.value = ''

  try {
    const loadedStudy = await loadStudy()
    if (loadedStudy) {
      if (await loadInvitation(loadedStudy)) {
        return
      }
      await handleLoadedStudy(loadedStudy)
      return
    }

    if (!(await loadInvitation())) {
      await denyAccess()
    }
  } finally {
    loading.value = false
  }
})
</script>
