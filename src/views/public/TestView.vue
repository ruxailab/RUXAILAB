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
            <v-btn color="primary" :loading="accepting" @click="acceptInvitation">
              Accept invitation
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <div v-else-if="test">
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
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
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
import { showError } from '@/shared/utils/toast'

const props = defineProps({
  id: { type: String, default: '' },
  token: { type: String, default: null },
})

const store = useStore()

const test = computed(() => store.getters.test)
const moderatedTestViewRef = ref(null)
const invitation = ref(null)
const accepting = ref(false)

const loadStudy = async () => {
  const loaded = await store.dispatch('getStudy', { id: props.id })
  if (loaded) await store.dispatch('getCurrentTestAnswerDoc')
}

const acceptInvitation = async () => {
  accepting.value = true
  try {
    await manageStudyMembership({ studyId: props.id, action: 'accept' })
    invitation.value = null
    await loadStudy()
  } catch (error) {
    showError(error?.message || 'Unable to accept this invitation.')
  } finally {
    accepting.value = false
  }
}

onBeforeMount(async () => {
  if (props.token) {
    try {
      invitation.value = await getStudyInvitation({
        studyId: props.id,
        token: props.token,
      })
      return
    } catch {
      // Accepted members and owners proceed through the regular study read.
    }
  }
  await loadStudy()
})
</script>
