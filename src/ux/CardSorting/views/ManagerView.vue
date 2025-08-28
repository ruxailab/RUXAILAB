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
import ManagerView from '@/shared/views/template/ManagerView.vue';
import { ACCESS_LEVEL } from '@/utils/accessLevel';
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

  return currentTest?.isPublic ? ACCESS_LEVEL.GUEST : ACCESS_LEVEL.EVALUETOR
})

const navigator = computed(() => {
  if (!test.value) return []

  const items = [
    { title: 'Manager', icon: 'mdi-home', path: `/cardSorting/manager/${route.params.id}` }
  ]

  if (accessLevel.value === 0) {
    items.push(
      { title: 'Test', icon: 'mdi-file-document-edit', path: `/cardSorting/edittest/${test.value.id}` },
      { title: 'Preview', icon: 'mdi-file-eye', path: `/cardSorting/test/${test.value.id}` },
      { title: 'Cooperators', icon: 'mdi-account-group', path: `/cardSorting/cooperators/${test.value.id}` },
      { title: 'Settings', icon: 'mdi-cog', path: `/cardSorting/settings/${test.value.id}` }
    )
  }

  return items
})

const topCards = computed(() => {
  if (!test.value) return []
  return [
    {
      image: 'IntroEdit.svg',
      title: 'test',
      imageStyle: 'transform: rotateY(180deg);',
      bottom: '#000',
      description: 'edit',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #d128c9, #9a1aab); overflow: hidden',
      path: `/cardSorting/edittest/${test.value.id}`,
    },
    {
      image: 'IntroCoops.svg',
      title: 'cooperators',
      imageStyle: '',
      bottom: '#000',
      description: 'cooperators',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden',
      path: `/cardSorting/cooperators/${test.value.cooperators}`,
    },
  ]
})

// Lifecycle
onMounted(async () => {
  await store.dispatch('getTest', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
