<template>
  <div>
    <ManagerView
      :navigator="navigator"
      :top-cards="topCards"
      :bottom-cards="bottomCards"
    />
  </div>
</template>

<script setup>
import { getBottomCardsDefualt, getNavigatorDefault, getTopCardsDefualt } from '@/shared/utils/managerDefault';
import ManagerView from '@/shared/views/template/ManagerView.vue';
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

// Stores
const store = useStore()
const route = useRoute()

// Computed
const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

const accessLevel = computed(() => {
  const currentUser = user.value
  const currentTest = test.value

  if (!currentUser) return ACCESS_LEVEL.GUEST
  if (currentUser.accessLevel === 0) return ACCESS_LEVEL.ADMIN
  if (currentTest?.testAdmin?.userDocId === currentUser.id) return ACCESS_LEVEL.ADMIN

  const coop = currentTest?.cooperators?.find(c => c.userDocId === currentUser.id)
  if (coop) return coop.accessLevel

  return currentTest?.isPublic ? ACCESS_LEVEL.GUEST : ACCESS_LEVEL.EVALUATOR
})

const topCards = computed(() => getTopCardsDefualt(test.value, 'heuristic'))
const bottomCards = computed(() => getBottomCardsDefualt(test.value, 'heuristic'))
const navigator = computed(() => {
  const items = [
    ...getNavigatorDefault(test.value, accessLevel.value, route, 'heuristic'),
  ]

  if (accessLevel.value === 0 && test.value) {
    items.push({
      title: 'Final Report',
      icon: 'mdi-file-document',
      path: `/heuristic/finalreport/${test.value.id}`,
    })
  }

  return items
})

// Lifecycle
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
