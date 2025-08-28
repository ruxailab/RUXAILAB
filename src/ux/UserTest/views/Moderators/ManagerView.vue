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
    { title: 'Manager', icon: 'mdi-home', path: `/userTest/moderated/manager/${route.params.id}` }
  ]

  if (accessLevel.value === 0) {
    items.push(
      { title: 'Test', icon: 'mdi-file-document-edit', path: `/userTest/moderated/edit/${test.value.id}` },
      { title: 'Preview', icon: 'mdi-file-eye', path: `/testview/${test.value.id}` },
      { title: 'Reports', icon: 'mdi-book-multiple', path: `/userTest/moderated/report/${test.value.id}` },
      { title: 'Answers', icon: 'mdi-order-bool-ascending-variant', path: `/userTest/moderated/answer/${test.value.id}` },
      { title: 'Cooperators', icon: 'mdi-account-group', path: `/userTest/moderated/cooperators/${test.value.id}` },
      { title: 'Settings', icon: 'mdi-cog', path: `/userTest/moderated/settings/${test.value.id}` }
    )
  }

  if (accessLevel.value === 1) {
    items.push(
      { title: 'Answer Test', icon: 'mdi-file-document', path: `/testview/${test.value.id}` },
      { title: 'Reports', icon: 'mdi-book-multiple', path: `/userTest/moderated/report/${test.value.id}` },
      { title: 'Answers', icon: 'mdi-order-bool-ascending-variant', path: `/userTest/moderated/answer/${test.value.id}` }
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
      path: `/userTest/moderated/edit/${test.value.id}`,
    },
    {
      image: 'IntroCoops.svg',
      title: 'cooperators',
      imageStyle: '',
      bottom: '#000',
      description: 'cooperators',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #eff31a, #eecf22); overflow: hidden',
      path: `/userTest/moderated/cooperators/${test.value.cooperators}`,
    },
  ]
})

const bottomCards = computed(() => {
  if (!test.value || !test.value.answersDocId) return []
  return [
    {
      image: 'IntroReports.svg',
      title: 'reports',
      imageStyle: 'height: 250px',
      bottom: '#000',
      description: 'reports',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #FF3C00, #FF0000); overflow: hidden',
      path: `/userTest/moderated/report/${test.value.answersDocId}`,
    },
    {
      image: 'IntroAnswer.svg',
      title: 'answers',
      imageStyle: 'height: 250px',
      bottom: '#000',
      description: 'answers',
      cardStyle:
        'background-image: radial-gradient(circle at top right, #9ac94f, #7eb543); overflow: hidden',
      path: `/userTest/moderated/answer/${test.value.answersDocId}`,
    },
  ]
})

// Lifecycle
onMounted(async () => {
  await store.dispatch('getTest', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
