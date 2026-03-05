<template>
  <div>
    <!-- Loading state -->
    <h1 v-if="isLoading" class="text-center my-10">Loading...</h1>

    <!-- Main content -->
    <div v-else>
      <ManagerBanner :title="store.getters.test?.testTitle || ''" />
      <CardsManager :cards="managerCards" :per-row="mdAndUp ? 3 : 1" @click="(path) => router.push(path)" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useStore } from 'vuex'
import CardsManager from '@/shared/components/CardsManager'
import ManagerBanner from '@/shared/components/ManagerBanner.vue'
import { INTRO_IMAGES } from '@/shared/constants/theme'
import { useAccessibilityAccess } from '@/ux/accessibility/composables/useAccessibilityAccess.js'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { mdAndUp } = useDisplay()
const testId = ref(route.params.id || '')

const { isLoading, fetchAccessData } = useAccessibilityAccess()

onMounted(async () => {
  await fetchAccessData(testId.value)
})

const navItems = computed(() => [
  {
    title: 'Examine',
    icon: 'mdi-brain',
    path: `/accessibility/aiassisted/examine/${testId.value}`,
  },
  {
    title: 'Answers',
    icon: 'mdi-help-circle',
    path: `/accessibility/aiassisted/answers/${testId.value}`,
  },
  {
    title: 'Report',
    icon: 'mdi-file-document',
    path: `/accessibility/aiassisted/report/${testId.value}`,
  },
  {
    title: 'Settings',
    icon: 'mdi-cog',
    path: `/accessibility/aiassisted/settings/${testId.value}`,
  },
])

const imageMap = {
  examine: INTRO_IMAGES.ANALYTICS,
  answers: INTRO_IMAGES.ANSWER,
  report: INTRO_IMAGES.REPORTS,
  settings: INTRO_IMAGES.EDIT,
}

const getDescription = (title) => {
  const descriptions = {
    Examine: 'Run AI-assisted accessibility tools',
    Answers: 'View collected accessibility answers',
    Report: 'Generate detailed accessibility reports',
    Settings: 'Configure test preferences and options',
  }
  return descriptions[title] || 'Navigate to this section'
}

const managerCards = computed(() =>
  navItems.value.map((item) => ({
    image: imageMap[item.title.toLowerCase()] || INTRO_IMAGES.MANAGER,
    titleDirect: item.title,
    imageStyle: '',
    descriptionDirect: getDescription(item.title),
    cardStyle: '',
    path: item.path,
  })),
)
</script>

<style scoped>
.h-64 {
  height: 16rem;
}

.card-container {
  max-width: 1400px;
}

.presentation-text {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
}
</style>
