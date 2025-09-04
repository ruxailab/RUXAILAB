<template>
  <div v-if="test">
    <div v-if="test.testType == STUDY_TYPES.HEURISTIC">
      <HeuristicTestView
        :id="id"
        :token="token"
      />
    </div>
    <div v-if="test.testType == STUDY_TYPES.USER && test.subType === USER_STUDY_SUBTYPES.UNMODERATED">
      <UserTestView />
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
import UserTestView from '@/ux/UserTest/views/UserTestView.vue'
import ModeratedTestView from '../../ux/UserTest/views/ModeratedTestView.vue'
import HeuristicTestView from '../../ux/Heuristic/views/HeuristicTestView.vue'
import { STUDY_TYPES, USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions'

const props = defineProps({
  id: { type: String, default: '' },
  token: { type: String, default: null },
})

const store = useStore()

const test = computed(() => store.getters.test)
const moderatedTestViewRef = ref(null)

onBeforeMount(async () => {
  await store.dispatch('getStudy', { id: props.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>