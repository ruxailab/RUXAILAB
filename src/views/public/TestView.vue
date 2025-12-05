<template>
  <div v-if="test">
    <div v-if="test.testType == STUDY_TYPES.HEURISTIC">
      <HeuristicTestView
        :id="id"
        :token="token"
      />
    </div>
    <div v-if="test.testType == STUDY_TYPES.USER && test.subType === USER_STUDY_SUBTYPES.UNMODERATED">
      <!-- id and token were not passed to UserTestView  -->
      <UserTestView
        :id="id"
        :token="token"
      />
    </div>
    <div v-if="test.testType === STUDY_TYPES.USER && test.subType === USER_STUDY_SUBTYPES.MODERATED">
      <ModeratedTestView
        ref="moderatedTestViewRef"
        :token="token"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRouter} from 'vue-router'
import UserTestView from '@/ux/UserTest/views/UserTestView.vue'
import ModeratedTestView from '../../ux/UserTest/views/ModeratedTestView.vue'
import HeuristicTestView from '../../ux/Heuristic/views/HeuristicTestView.vue'
import validateStudyAccess from '@/shared/utils/studyValidation';
import { STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions'

const props = defineProps({
  id: { type: String, default: '' },
  token: { type: String, default: null },
})

const store = useStore()
const router = useRouter()
const test = computed(() => store.getters.test)
const moderatedTestViewRef = ref(null)

const handleInvalidAccess = async(message) => {
  console.error(message)
  store.commit('SET_TOAST', {message, type: "error"});
  await store.dispatch('logout');
  router.push('/signin');
}

onBeforeMount(async () => {
  try {
    const user = await store.dispatch('signInAnonymously');
    console.log(user, "user from TestView.vue");
  } catch (error) {
    await handleInvalidAccess("Unable to start guest session. Please try again.");
    return; // end here
  }
  const study = await store.dispatch('getStudy', { id: props.id });
  if (!study) {
    await handleInvalidAccess("Test not found, Invalid URL");
    return; 
  }

  const hasAccess = validateStudyAccess(study, props.token);
  if (!hasAccess) {
    await handleInvalidAccess("Invalid Token, Access Denied");
    return;
  }
  console.log(props.id, "id");
  console.log(study, "study loaded successfully from TestView.vue");
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>