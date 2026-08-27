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
      <StartScreenTest
        v-if="!isCardSortingStarted"
        :test="test"
        :disabled="!hasCardSortingContent"
        :alert-message="
          hasCardSortingContent ? '' : $t('CardSorting.invalidConfiguration')
        "
        @start="isCardSortingStarted = true"
      />
      <CardSortingTest v-else :test="test" />
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
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'

import UserTestView from '@/ux/UserTest/views/UserTestView.vue'
import ModeratedTestView from '../../ux/UserTest/views/ModeratedTestView.vue'
import HeuristicTestView from '../../ux/Heuristic/views/HeuristicTestView.vue'
import CardSortingTest from '@/ux/CardSorting/components/CardSortingTest.vue'
import StartScreenTest from '@/shared/components/template/StartScreenTest.vue'

import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'

import { getTestViewAccessRedirect } from '@/shared/utils/studyNavigation'
import { showError } from '@/shared/utils/toast'

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

const hasCardSortingContent = computed(() => {
  if (test.value?.testType !== STUDY_TYPES.CARD_SORTING) return true

  const cardSorting = test.value.testStructure?.cardSorting
  return (
    Array.isArray(cardSorting?.categories) &&
    cardSorting.categories.length > 0 &&
    Array.isArray(cardSorting?.cards) &&
    cardSorting.cards.length > 0
  )
})

const user = computed(() => store.getters.user)

const userId = computed(() => user.value?.id ?? user.value?.uid ?? null)

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const moderatedTestViewRef = ref(null)
const isCardSortingStarted = ref(false)
const invitation = ref(null)
const loading = ref(true)
const redirecting = ref(false)
const accessError = ref('')

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
  })

  if (!destination) {
    return true
  }

  await redirectIfNeeded(destination)

  return false
}

/*
|--------------------------------------------------------------------------
| Invitation
|--------------------------------------------------------------------------
*/

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
  invitation.value = null

  try {
    const loadedStudy = await loadStudy()

    if (!loadedStudy) {
      await denyAccess()
      return
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
          const hasAccessThroughInvitation =
            await handleLoadedStudy(loadedStudy)

          if (!hasAccessThroughInvitation) {
            await denyAccess()
          }

          return
        }

        /*
         * Authenticated invitation:
         *
         * There is no acceptance screen anymore.
         * Let the normal access policy determine whether
         * the current user can enter the study.
         */
        const hasAccess = await handleLoadedStudy(loadedStudy)

        if (!hasAccess) {
          await denyAccess()
        }

        return
      }
    }

    /*
     * No valid invitation:
     *
     * Fall back to the normal study access flow.
     */
    const hasAccess = await handleLoadedStudy(loadedStudy)

    if (!hasAccess) {
      await denyAccess()
    }
  } finally {
    loading.value = false
  }
})
</script>
