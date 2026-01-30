<template>
  <v-container fluid class="pa-0">
    <!-- Header with User Welcome -->
    <div class="dashboard-header mb-6">
      <h1 class="text-h4 font-weight-bold text-grey-darken-4 mb-2">
        {{ $t('Dashboard.welcomeBack', { name: userDisplayName }) }} 👋
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
        {{ $t('Dashboard.subtitle') }}
      </p>
    </div>

    <!-- Stats Cards Row -->
    <StatsCards
      :total-studies="totalStudies"
      :used-storage="usedStorage"
      :total-participants="totalParticipants"
    />

    <!-- Second Row: Activity Timeline and Active Studies -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <div class="component-height">
          <ActiveStudies :studies="items" />
        </div>
      </v-col>
      <v-col cols="12" lg="4">
        <div class="component-height">
          <ActivityTimeline />
        </div>
      </v-col>
    </v-row>

    <!-- Third Row: Upcoming Webinar and Top Methods -->
    <v-row class="mb-6">
      <v-col cols="12" lg="4">
        <UpcomingWebinar :webinar-data="upcomingWebinar || {}" />
      </v-col>
      <v-col cols="12" lg="4">
        <TopMethods :methods-data="topMethodsData" />
      </v-col>
      <v-col cols="12" lg="4">
        <NextSession :next-session="nextSession" />
      </v-col>
    </v-row>

    <!-- Fourth Row: Blog Posts and Next Session -->
    <v-row class="mb-6">
      <v-col cols="12" lg="6">
        <BlogPosts />
      </v-col>
      <v-col cols="12" lg="6" />
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import StatsCards from '@/features/dashboard/components/StatsCards.vue'
import ActivityTimeline from '@/features/dashboard/components/ActivityTimeline.vue'
import ActiveStudies from '@/features/dashboard/components/ActiveStudies.vue'
import BlogPosts from '@/features/dashboard/components/BlogPosts.vue'
import UpcomingWebinar from '@/features/dashboard/components/UpcomingWebinar.vue'
import TopMethods from '@/features/dashboard/components/TopMethods.vue'
import NextSession from '@/features/dashboard/components/NextSession.vue'
import { getMethodDefinition } from '@/shared/constants/methodDefinitions'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
  sessions: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const store = useStore()

const usedStorage = ref(0)
const nextSession = ref(null)

const userDisplayName = computed(() => {
  const user = store.getters.user
  return user?.username?.split(' ')[0] || 'User'
})

const userStorageUsage = computed(() => {
  const user = store.getters.user
  return user?.storageUsageMB || 0
})

const userStudies = computed(() => {
  const user = store.getters.user
  if (!user || !props.items) return []

  return props.items.filter((study) => study?.testAdmin?.userDocId === user.id)
})

const totalStudies = computed(() => userStudies.value.length)

const totalParticipants = computed(() => {
  return userStudies.value.flatMap((s) => s.cooperators || []).length
})

const upcomingWebinar = computed(
  () => store.getters['Dashboard/upcomingWebinar'],
)

const topMethodsData = computed(() => {
  const methodCounts = {}

  userStudies.value.forEach((study) => {
    const key = `${study.testType}|${study.subType || ''}`

    if (!methodCounts[key]) {
      const def = getMethodDefinition(study.testType, study.subType)
      if (def) {
        methodCounts[key] = {
          id: key,
          count: 0,
          name: def.nameEn,
          type: def.name,
          icon: def.icon,
          color: def.color,
          bgColor: def.color,
        }
      }
    }

    if (methodCounts[key]) {
      methodCounts[key].count++
    }
  })
  return Object.values(methodCounts)
    .sort((a, b) => b.count - a.count)
    .map((m) => ({
      ...m,
      usage: m.count.toString(),
    }))
})

watch(
  () => props.sessions,
  (sessions) => {
    if (!sessions?.length) {
      nextSession.value = null
      return
    }

    const now = new Date()
    const futureSessions = sessions.filter((s) => new Date(s.testDate) > now)

    if (!futureSessions.length) {
      nextSession.value = null
      return
    }

    futureSessions.sort((a, b) => new Date(a.testDate) - new Date(b.testDate))
    nextSession.value = futureSessions[0]
  },
  { immediate: true, deep: true },
)

watch(
  () => userStorageUsage.value,
  (newVal) => {
    usedStorage.value = parseFloat(newVal)
  },
  { immediate: true },
)

onMounted(() => {
  store.dispatch('Dashboard/fetchUpcomingWebinar')
})
</script>

<style scoped>
.dashboard-container {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.dashboard-header {
  text-align: left;
}

.component-height {
  height: 500px;
}

.component-height :deep(.v-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.component-height :deep(.v-card-text) {
  flex: 1;
  overflow-y: auto;
}
:deep(.v-row) {
  margin: -14px !important;
}
</style>
