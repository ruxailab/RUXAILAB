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
  <!-- Onboarding for new users -->
  <v-alert
    v-if="!loading && userStudies.length === 0"
    color="info"
    variant="tonal"
    icon="mdi-rocket-launch"
    border="start"
    class="mb-6 pa-4"
  >
    <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4">
      
      <div>
        <v-alert-title class="text-h6 mb-1">
          {{ $t('Get started with your first study') }}
        </v-alert-title>
        
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ $t('Create a study, invite participants, and start collecting insights.') }}
        </p>
      </div>

      <v-btn
        color="primary"
        size="default"
        density="comfortable"
        prepend-icon="mdi-plus"
        to="/choose"
        variant="flat"
        class="text-none"
      >
        {{ $t('Create your first study') }}
      </v-btn>

    </div>
  </v-alert>
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
          <ActiveStudies :studies="userStudies" />
        </div>
      </v-col>
      <v-col cols="12" lg="4">
        <div class="component-height">
          <ActivityTimeline :activities="activities" />
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
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import StatsCards from '@/features/dashboard/components/StatsCards.vue'
import ActivityTimeline from '@/features/dashboard/components/ActivityTimeline.vue'
import ActiveStudies from '@/features/dashboard/components/ActiveStudies.vue'
import BlogPosts from '@/features/dashboard/components/BlogPosts.vue'
import UpcomingWebinar from '@/features/dashboard/components/UpcomingWebinar.vue'
import TopMethods from '@/features/dashboard/components/TopMethods.vue'
import NextSession from '@/features/dashboard/components/NextSession.vue'
import { getMethodDefinition } from '@/shared/constants/methodDefinitions'
import UserController from '@/features/auth/controllers/UserController'

const store = useStore()
const router = useRouter()
const userController = new UserController()

const items = ref([])
const sessions = ref([])
const activities = ref([])
const usedStorage = ref(0)
const nextSession = ref(null)
const loading = ref(true)

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
  if (!user || !items.value) return []

  return items.value.filter((study) => study?.testAdmin?.userDocId === user.id)
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

const mapNotificationsToActivities = (notifications) => {
  if (!notifications) return []
  // Sort by date descending
  const sorted = [...notifications].sort((a, b) => b.createdDate - a.createdDate)
  
  return sorted.slice(0, 5).map((n, index) => ({
    id: n.id || index,
    time: n.createdDate ? formatDistanceToNow(new Date(n.createdDate), { addSuffix: true }) : '',
    color: n.read ? 'grey' : 'primary',
    user: {
      name: 'System', 
    },
    action: 'Notification',
    description: n.message || 'New notification',
  }))
}

const fetchDashboardData = async () => {
    loading.value = true
    try {
        const user = store.getters.user
        if (user) {
            // Fetch complete user data including studies
            const completeUser = await userController.getUserWithStudies(user.id)
            
            // Extract studies
            const myTests = Object.values(completeUser.myTests || {})
            items.value = myTests

             // Extract sessions from studies
            sessions.value = myTests
                .filter(s => s.endDate && new Date(s.endDate) > new Date())
                .map(s => ({
                    ...s,
                    testDate: s.endDate 
                }))
            
            // Extract activities from notifications
            activities.value = mapNotificationsToActivities(completeUser.notifications || [])
            
            // Update storage if needed
            usedStorage.value = completeUser.storageUsageMB || 0
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
    } finally {
        loading.value = false
    }
}

watch(
  () => sessions.value,
  (newSessions) => {
    if (!newSessions?.length) {
      nextSession.value = null
      return
    }

    const now = new Date()
    const futureSessions = newSessions.filter((s) => new Date(s.testDate) > now)

    if (!futureSessions.length) {
      nextSession.value = null
      return
    }

    futureSessions.sort((a, b) => new Date(a.testDate) - new Date(b.testDate))
    nextSession.value = futureSessions[0]
  },
  { deep: true },
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
  fetchDashboardData()
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
</style>
