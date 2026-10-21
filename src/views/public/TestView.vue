<template>
  <div v-if="test && !redirecting">
    <div v-if="test.testType === STUDY_TYPES.HEURISTIC">
      <HeuristicTestView :id="id" :token="token" />
    </div>

    <div
      v-if="
        test.testType === STUDY_TYPES.USER &&
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

    <div v-if="test.testType === STUDY_TYPES.CARD_SORTING">
      <CardSortingTest :test="test" />
    </div>
  </div>

  <PageNotFound v-else-if="notFound" />

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
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'

import UserTestView from '@/ux/UserTest/views/UserTestView.vue'
import ModeratedTestView from '../../ux/UserTest/views/ModeratedTestView.vue'
import HeuristicTestView from '../../ux/Heuristic/views/HeuristicTestView.vue'
import CardSortingTest from '@/ux/CardSorting/components/CardSortingTest.vue'
import PageNotFound from '@/shared/views/public/PageNotFoundView.vue'

import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'

import { getTestViewAccessRedirect } from '@/shared/utils/studyNavigation'
import { usesTestViewToken } from '@/shared/utils/studyAccessPolicy'
import { isSignInPath } from '@/shared/utils/authRedirect'
import { showError } from '@/shared/utils/toast'
import AuthController from '@/features/auth/controllers/AuthController'
import '@/shared/styles/testProgressStepper.css'

const props = defineProps({
  id: {
    type: String,
    default: '',
  },

  token: {
    type: String,
    default: null,
  },
})

const store = useStore()
const router = useRouter()
const route = useRoute()

/*
|--------------------------------------------------------------------------
| Store
|--------------------------------------------------------------------------
*/

const test = computed(() => {
  const currentTest = store.getters.test

  if (currentTest?.id === props.id || currentTest?.testDocId === props.id) {
    return currentTest
  }

  return null
})

const user = computed(() => store.getters.user)

const userId = computed(() => user.value?.id ?? user.value?.uid ?? null)

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const moderatedTestViewRef = ref(null)
const invitation = ref(null)
const loading = ref(true)
const redirecting = ref(false)
const accessError = ref('')
const notFound = ref(false)

/*
|--------------------------------------------------------------------------
| Invite
|--------------------------------------------------------------------------
*/

const inviteToken = computed(
  () => route.query.inviteToken || props.token || null,
)

const isAnonymousInvitation = computed(
  () =>
    invitation.value?.requiredLogin === false &&
    invitation.value?.studyId === props.id,
)

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const ACCESS_ERROR_MESSAGE =
  "You do not have access to the page you're trying to access."

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

const redirectIfNeeded = async (destination) => {
  if (!destination || router.currentRoute.value.fullPath === destination) {
    return
  }

  redirecting.value = true
  await router.replace(destination)
}

/*
|--------------------------------------------------------------------------
| Study
|--------------------------------------------------------------------------
*/

const loadStudy = async () => {
  const loaded = await store.dispatch('getStudy', {
    id: props.id,
  })

  if (loaded) {
    await store.dispatch('getCurrentTestAnswerDoc')
  }

  return loaded
}

const loadSession = async (loadedStudy) => {
  if (!props.token || !loadedStudy?.id || props.token === userId.value) {
    return null
  }

  return await store.dispatch('getSession', {
    studyId: loadedStudy.id,
    sessionId: props.token,
  })
}

/*
|--------------------------------------------------------------------------
| Access
|--------------------------------------------------------------------------
*/

const denyAccess = async () => {
  accessError.value = ACCESS_ERROR_MESSAGE
  showError('AccessNotAllowed.noAccess')

  await redirectIfNeeded('/admin')
}

const handleLoadedStudy = async (loadedStudy) => {
  const destination = getTestViewAccessRedirect({
    study: loadedStudy,
    user: user.value,
    token: props.token,
    invitation: invitation.value,
    redirectTo: route.fullPath,
  })

  if (!destination) {
    return true
  }

  /*
   * Being asked to sign in is not an access denial: the participant simply has
   * not identified themselves yet, and the study is waiting for them.
   */
  if (!isSignInPath(destination)) {
    accessError.value = ACCESS_ERROR_MESSAGE
    showError('AccessNotAllowed.noAccess')
  }

  await redirectIfNeeded(destination)

  return false
}

/*
|--------------------------------------------------------------------------
| Invitation
|--------------------------------------------------------------------------
*/

/*
 * A link that does not require login is answered with an anonymous account.
 * It joins the study through that invitation first, because only members and
 * signed-in users may read a study.
 */
const joinAnonymously = async () => {
  try {
    const participant = await new AuthController().anonymousParticipant()
    if (!participant) return
    await store.dispatch('acceptStudyCollaboration', {
      studyId: props.id,
      cooperator: { id: participant.uid, email: null },
      membershipType: 'participant',
      inviteToken: inviteToken.value,
    })
  } catch {
    // Fall through: the normal access check below explains the denial.
  }
}

const loadInvitation = async () => {
  if (!inviteToken.value) {
    return false
  }

  try {
    const invite = await store.dispatch('loadPendingInvite', {
      token: inviteToken.value,
    })

    if (!invite) {
      invitation.value = null
      return false
    }

    invitation.value = invite

    return true
  } catch {
    invitation.value = null
    return false
  }
}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onBeforeMount(async () => {
  loading.value = true
  redirecting.value = false
  accessError.value = ''
  notFound.value = false
  invitation.value = null

  try {
    if (inviteToken.value && !store.getters.user) {
      await loadInvitation()
      if (isAnonymousInvitation.value) await joinAnonymously()
    }

    const loadedStudy = await loadStudy()

    /*
     * getStudy resolves null when the study does not exist and undefined when
     * reading it failed, e.g. because access was denied.
     */
    if (loadedStudy === null) {
      notFound.value = true
      return
    }

    if (!loadedStudy) {
      await denyAccess()
      return
    }

    /*
     * Unmoderated studies ignore the second URL segment. Drop it from old
     * links so the participant lands on the clean study URL.
     */
    if (props.token && !usesTestViewToken(loadedStudy)) {
      await router.replace({
        name: 'TestView',
        params: { id: props.id },
        query: route.query,
        hash: route.hash,
      })
    }

    /*
     * Moderated sessions have their own access flow.
     */
    if (
      loadedStudy.testType === STUDY_TYPES.USER &&
      loadedStudy.subType === USER_STUDY_SUBTYPES.MODERATED &&
      props.token
    ) {
      const loadedSession = await loadSession(loadedStudy)

      if (!loadedSession) {
        await denyAccess()
        return
      }

      return
    }

    /*
     * Resolve the invitation before checking regular access.
     */
    if (inviteToken.value) {
      const hasInvitation = await loadInvitation()

      if (hasInvitation) {
        /*
         * Anonymous invitation:
         *
         * A valid public invitation allows the participant
         * to enter the study without STUDY_ANSWER capability.
         */
        if (isAnonymousInvitation.value) {
          await handleLoadedStudy(loadedStudy)

          return
        }

        /*
         * Authenticated invitation:
         *
         * There is no acceptance screen anymore.
         * Let the normal access policy determine whether
         * the current user can enter the study.
         */
        await handleLoadedStudy(loadedStudy)

        return
      }
    }

    /*
     * No valid invitation:
     *
     * Fall back to the normal study access flow.
     */
    await handleLoadedStudy(loadedStudy)
  } finally {
    loading.value = false
  }
})
</script>
