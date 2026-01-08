<template>
  <div>
    <ManagerView
      :navigator="navigator"
      :top-cards="topCards"
      :bottom-cards="[]"
    />
  </div>
</template>

<script setup>
import ManagerView from '@/shared/views/template/ManagerView.vue'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  getNavigatorDefault,
  getTopCardsDefualt,
} from '@/shared/utils/managerDefault'

// Stores
const store = useStore()
const route = useRoute()
const router = useRouter()

// Computed
const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

const accessLevel = computed(() => {
  const currentUser = user.value
  const currentTest = test.value

  if (!currentUser) return ACCESS_LEVEL.GUEST
  if (currentUser.accessLevel === 0) return ACCESS_LEVEL.ADMIN
  if (currentTest?.testAdmin?.userDocId === currentUser.id)
    return ACCESS_LEVEL.ADMIN

  const coop = currentTest?.cooperators?.find(
    (c) => c.userDocId === currentUser.id,
  )
  if (coop) return coop.accessLevel

  // Fixed logic: Public studies allow guest access, private studies block non-collaborators
  if (currentTest?.isPublic) {
    return ACCESS_LEVEL.GUEST // Public studies: allow as guest
  } else {
    return null // Private studies: no access for non-collaborators
  }
})

// Add access control check
watchEffect(() => {
  if (user.value != null && test.value != null) {
    // Allow ADMIN, EVALUATOR, and GUEST (for public studies)
    const hasAccess =
      accessLevel.value === ACCESS_LEVEL.ADMIN ||
      accessLevel.value === ACCESS_LEVEL.EVALUATOR ||
      accessLevel.value === ACCESS_LEVEL.GUEST

    if (!hasAccess || accessLevel.value === null) {
      router.push('/')
    }
  }
})

const topCards = computed(() => getTopCardsDefualt(test.value, 'cardSorting'))
const navigator = computed(() => {
  const items = getNavigatorDefault(
    test.value,
    accessLevel.value,
    route,
    'cardSorting',
  )

  for (const item of items) {
    if (item.title === 'Preview') {
      item.path = `/cardSorting/test/${test.value.id}`
    }
  }

  return items
})

// Lifecycle
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
