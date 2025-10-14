<template>
  <v-container
    fluid
    class="dashboard-container"
  >
    <!-- Header with User Welcome -->
    <div class="dashboard-header mb-6">
      <h1 class="text-h4 font-weight-bold text-grey-darken-4 mb-2">
        Welcome back, {{ userDisplayName }}! 👋
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
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
    <v-row class="mb-6">
      <v-col
        cols="12"
        lg="8"
      >
        <div class="component-height">
          <ActiveStudies 
            :studies="items"
            @update-total="totalParticipants = $event"
          />
        </div>
      </v-col>
      <v-col
        cols="12"
        lg="4"
      >
        <div class="component-height">
          <ActivityTimeline />
        </div>
      </v-col>
    </v-row>

    <!-- Third Row: Upcoming Webinar and Top Methods -->
    <v-row class="mb-6">
      <v-col
        cols="12"
        lg="4"
      >
        <UpcomingWebinar />
      </v-col>
      <v-col
        cols="12"
        lg="4"
      >
        <TopMethods />
      </v-col>
      <v-col
        cols="12"
        lg="4"
      >
        <NextSession :next-session="sessions" />
      </v-col>
    </v-row>

    <!-- Fourth Row: Blog Posts and Next Session -->
    <v-row class="mb-6">
      <v-col
        cols="12"
        lg="6"
      >
        <BlogPosts />
      </v-col>
      <v-col
        cols="12"
        lg="6"
      />
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n();

const totalStudies = ref(0);
const usedStorage = ref(0);
const totalParticipants = ref(0);

const userDisplayName = computed(() => {
  const user = store.getters.user;
  return user?.username?.split(' ')[0] || 'User';
});

const userStorageUsage = computed(() => {
  const user = store.getters.user;
  return user?.storageUsageMB || 0;
});


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
    totalStudies.value = newVal.length;
  },
  { immediate: true }
);
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
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

@media (max-width: 960px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .component-height {
    height: auto;
    min-height: 400px;
  }
}
</style>
