<template>
  <v-container
    fluid
    class="dashboard-container"
  >
    <!-- Header with User Welcome -->
    <div class="dashboard-header mb-4 mb-md-6">
      <h1 class="text-h5 text-md-h4 font-weight-bold text-grey-darken-4 mb-1 mb-md-2">
        Welcome back, {{ userDisplayName }}! 👋
      </h1>
      <p class="text-body-2 text-md-subtitle-1 text-grey-darken-1">
        Here's what's happening with your research projects today
      </p>
    </div>

    <!-- Stats Cards Row -->
    <StatsCards
      :total-studies="totalStudies"
      :used-storage="usedStorage"
      :total-participants="totalParticipants"
    />

    <!-- Second Row: Activity Timeline and Active Studies -->
    <v-row class="mb-4 mb-md-6">
      <v-col
        cols="12"
        md="8"
        lg="8"
        class="mb-4 mb-md-0"
      >
        <div class="responsive-component">
          <ActiveStudies 
            :studies="items"
          />
        </div>
      </v-col>
      <v-col
        cols="12"
        md="4"
        lg="4"
      >
        <div class="responsive-component">
          <ActivityTimeline />
        </div>
      </v-col>
    </v-row>

    <!-- Third Row: Upcoming Webinar and Top Methods -->
    <v-row class="mb-4 mb-md-6">
      <v-col
        cols="12"
        sm="6"
        md="4"
        class="mb-4 mb-sm-0 mb-md-0"
      >
        <UpcomingWebinar />
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="4"
        class="mb-4 mb-sm-0 mb-md-0"
      >
        <TopMethods />
      </v-col>
      <v-col
        cols="12"
        sm="12"
        md="4"
      >
        <NextSession :next-session="nextSession" />
      </v-col>
    </v-row>

    <!-- Fourth Row: Blog Posts and Next Session -->
    <v-row class="mb-4 mb-md-6">
      <v-col cols="12" lg="6">
        <BlogPosts />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import StatsCards from '@/features/dashboard/components/StatsCards.vue'
import ActivityTimeline from '@/features/dashboard/components/ActivityTimeline.vue'
import ActiveStudies from '@/features/dashboard/components/ActiveStudies.vue'
import BlogPosts from '@/features/dashboard/components/BlogPosts.vue'
import UpcomingWebinar from '@/features/dashboard/components/UpcomingWebinar.vue'
import TopMethods from '@/features/dashboard/components/TopMethods.vue'
import NextSession from '@/features/dashboard/components/NextSession.vue'

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

const totalStudies = ref(0);
const usedStorage = ref(0);
const totalParticipants = ref(0);
const nextSession = ref(null);

const userDisplayName = computed(() => {
  const user = store.getters.user;
  return user?.username?.split(' ')[0] || 'User';
});

const userStorageUsage = computed(() => {
  const user = store.getters.user;
  return user?.storageUsageMB || 0;
});

watch(
  () => props.sessions,
  (sessions) => {
    if (!sessions?.length) {
      nextSession.value = null;
      return;
    }

    const now = new Date();
    const futureSessions = sessions.filter((s) => new Date(s.testDate) > now);

    if (!futureSessions.length) {
      nextSession.value = null;
      return;
    }

    futureSessions.sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
    nextSession.value = futureSessions[0];
  },
  { immediate: true, deep: true }
);

watch(
  () => userStorageUsage.value,
  (newVal) => {
    usedStorage.value = parseFloat(newVal);
  },
  { immediate: true }
);

watch(
  () => props.items,
  (newVal) => {
    const user = store.getters.user;
    if (!user || !newVal) {
      totalStudies.value = 0;
      totalParticipants.value = 0;
      return;
    }
    // Filters only the studies created by the logged-in user
    const userStudies = newVal.filter(
      (study) => study?.testAdmin?.userDocId === user.id
    );

    // Updates total studies
    totalStudies.value = userStudies.length;

    // Counts the total unique participants (cooperators)
    const participants = userStudies.flatMap((s) => s.cooperators || []);
    totalParticipants.value = participants.length;
  },
  { immediate: true }
);
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.dashboard-header {
  text-align: left;
}

.responsive-component {
  min-height: 400px;
  height: auto;
  max-height: 500px;
  overflow-y: auto;
}

.responsive-component :deep(.v-card) {
  height: auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.responsive-component :deep(.v-card-text) {
  flex: 1;
  overflow-y: auto;
}

/* Mobile-first responsive design */
@media (max-width: 600px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .dashboard-header h1 {
    font-size: 1.5rem !important;
    line-height: 1.3;
  }
  
  .responsive-component {
    min-height: 350px;
    max-height: 400px;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .responsive-component {
    min-height: 450px;
  }
}

@media (min-width: 961px) {
  .dashboard-container {
    padding: 24px;
  }
  
  .responsive-component {
    height: 500px;
  }
}

/* Ensure touch-friendly targets on mobile */
@media (max-width: 960px) {
  :deep(.clickable-item) {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>