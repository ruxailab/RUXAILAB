<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item
        prepend-avatar="/human.svg"
        nav
        border
      >
        <template #prepend>
          <v-avatar
            color="primary"
            size="40"
            class="me-2"
          >
            <v-icon
              icon="mdi-accessibility"
              color="white"
            />
          </v-avatar>
        </template>
        <v-list-item-title class="text-h6">
          {{ test?.title || 'Accessibility Test' }}
        </v-list-item-title>
        <template #append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider />

      <v-list
        density="compact"
        nav
      >
        <v-list-item
          v-for="item in navItems"
          :key="item.value"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          :to="item.route"
          :active="isActive(item.path)"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <TestInformationCard
              :test="test"
              :loading="loading"
              :test-id="$route.params.testId"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import { useRoute, useRouter,onBeforeRouteUpdate } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import TestInformationCard from '@/components/molecules/TestInformationCard.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const drawer = ref(true)
const rail = ref(true)
const loading = ref(false)
const test = ref(null)
const error = ref(null)

// Fetch test data when component mounts or testId changes
const fetchTest = async () => {
  if (!route.params.testId) return

  loading.value = true
  error.value = null

  try {
    const testData = await store.dispatch('manualAccessibility/fetchTest', route.params.testId)
    console.log(JSON.stringify(testData, null, 2))
    test.value = testData
  } catch (err) {
    console.error('Error fetching test:', err)
    error.value = 'Failed to load test information'
    toast.error('Failed to load test information')
  } finally {
    loading.value = false
  }
}


// Get color based on status
const getStatusColor = (status) => {
  const statusColors = {
    draft: 'grey',
    active: 'primary',
    completed: 'success',
    archived: 'error'
  }
  return statusColors[status?.toLowerCase()] || 'secondary'
}

// Check if a nav item is active
const isActive = (path) => {
  return route.path.endsWith(path) || route.path.endsWith(`${path}/`)
}

// Fetch test data when component mounts
onMounted(() => {
  if (route.params.testId) {
    fetchTest()
  }
})

// Watch for route changes to fetch new test data
onBeforeRouteUpdate(async (to, from, next) => {
  if (to.params.testId !== from.params.testId) {
    await fetchTest()
  }
  next()
})

const navItems = [
  {
    icon: 'mdi-pencil',
    title: 'Edit Test',
    value: 'EditAccessibilityTest',
    path: 'edit'
  },
  {
    icon: 'mdi-eye',
    title: 'Preview',
    value: 'PreviewAccessibilityTest',
    path: 'assessment'
  },
  {
    icon: 'mdi-message-text',
    title: 'Answers',
    value: 'AccessibilityTestAnswers',
    path: 'answers'
  },
  {
    icon: 'mdi-chart-box',
    title: 'Report',
    value: 'AccessibilityTestReport',
    path: 'report'
  },
  {
    icon: 'mdi-account-group',
    title: 'Cooperative',
    value: 'AccessibilityTestCooperative',
    path: 'cooperative'
  },
  {
    icon: 'mdi-cog',
    title: 'Settings',
    value: 'AccessibilityTestSettings',
    path: 'settings'
  },
].map(item => ({
  ...item,
  route: {
    path: `/${item.path}/${route.params.testId}`
  }
}))

</script>

<style scoped>
.test-info-card {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.test-info-card .v-card-title {
  background-color: #f5f5f5;
  padding: 16px 24px;
  font-weight: 600;
}

.test-info-card .v-card-text {
  padding: 24px;
}

.test-info-card .v-list-item {
  padding-left: 0;
  padding-right: 0;
}

.test-info-card .v-list-item .v-list-item__title {
  font-weight: 500;
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.6);
}

.test-info-card .v-list-item .v-list-item__subtitle {
  opacity: 1;
  color: rgba(0, 0, 0, 0.87) !important;
  font-size: 0.9375rem !important;
  line-height: 1.5;
}

.test-info-card a {
  color: var(--v-primary-base);
  text-decoration: none;
}

.test-info-card a:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 959px) {
  .test-info-card .v-card-text {
    padding: 16px;
  }

  .test-info-card .v-list-item {
    padding: 8px 0;
  }
}
</style>
