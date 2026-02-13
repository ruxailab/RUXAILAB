<template>
  <div v-if="test">
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
import { useRouter, useRoute } from 'vue-router'
import UserTestView from '@/ux/UserTest/views/UserTestView.vue'
import ModeratedTestView from '../../ux/UserTest/views/ModeratedTestView.vue'
import HeuristicTestView from '../../ux/Heuristic/views/HeuristicTestView.vue'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'

const props = defineProps({
  id: { type: String, default: '' },
  token: { type: String, default: null },
})

const store = useStore()
const route = useRoute()
const router = useRouter()

const test = computed(() => store.getters.test)
const user = computed(() => store.getters.user)
const moderatedTestViewRef = ref(null)

const checkAuthAndRedirect = ()=> {
  if(!user.value && !props.token){
    const returnUrl = route.fullPath
    router.push(`/signin?redirect=${encodeURIComponent(returnUrl)}`)
    return false
  }
  return true
}

onBeforeMount(async () => {
  // check if user is authenticated or not if not redirect to signin page with return url
  if(!checkAuthAndRedirect()) return
  await store.dispatch('getStudy', { id: props.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
