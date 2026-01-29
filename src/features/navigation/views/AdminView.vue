<template>
  <div class="dashboard-layout">
    <!-- 🧭 Sidebar navigation (Dashboard menu) -->
    <DashboardSidebar
      v-model="drawerOpen"
      :active-section="activeSection"
      :active-sub-section="activeSubSection"
      @navigate="selectNavigation"
      @create-test="goToCreateTestRoute"
    />

    <!-- 📄 Main content area -->
    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <!-- 🔹 Page header (dynamic title + subtitle with icon) -->
        <div class="content-header">
          <div class="d-flex align-center ga-3 mb-2">
            <v-icon :icon="currentPageIcon" size="32" color="primary"></v-icon>
            <h1 class="text-h4 font-weight-bold text-grey-darken-4">
              {{ currentPageTitle }}
            </h1>
          </div>
          <p class="text-h6 text-grey-darken-1">
            {{
              activeSection === 'studies'
                ? $t('pages.navigation.studiesSubtitle')
                : activeSection === 'templates'
                ? $t('pages.navigation.templatesSubtitle')
                : ''
            }}
          </p>
        </div>

        <!-- 🔸 Dynamic rendering of sections -->
        <div v-if="activeSection === 'dashboard'">
          <DashboardView :items="tests" :sessions="filteredModeratedSessions" />
        </div>

        <div v-if="activeSection === 'studies'">
          <StudiesSection />
        </div>

        <div v-if="activeSection === 'sessions'">
          <SessionsSection :sessions="filteredModeratedSessions" />
        </div>

        <div v-if="activeSection === 'templates'">
          <TemplatesSection />
        </div>

        <div v-if="activeSection === 'storage'">
          <StorageSection />
        </div>

        <div
          v-if="
            activeSection === 'community' &&
            activeSubSection === 'community-studies'
          "
        >
          <CommunityStudies />
        </div>

        <div
          v-if="
            activeSection === 'community' &&
            activeSubSection === 'community-templates'
          "
        >
          <CommunityTemplatesSection />
        </div>

        <div v-if="activeSection === 'notifications'">
          <NotificationPage />
        </div>

        <div v-if="activeSection === 'profile'">
          <ProfileView />
        </div>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
/**
 * 🧩 Imports and setup
 * This view manages the entire dashboard layout, handling the sidebar navigation
 * and rendering the correct section based on the active selection.
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

// Feature views
import ProfileView from '@/features/auth/views/ProfileView.vue'
import NotificationPage from '@/features/notifications/views/NotificationPage.vue'
import DashboardView from '@/features/dashboard/views/DashboardView.vue'

// Navigation and sections
import { DashboardSidebar } from '@/features/navigation/utils'
import SessionsSection from '../components/navbarSections/SessionsSection.vue'
import TemplatesSection from '../components/navbarSections/TemplatesSection.vue'
import StudiesSection from '../components/navbarSections/StudiesSection.vue'
import CommunityStudies from '../components/navbarSections/CommunityStudiesSection.vue'
import CommunityTemplatesSection from '../components/navbarSections/CommunityTemplatesSection.vue'
import StorageSection from '../components/navbarSections/StorageSection.vue'

// Utilities and constants
import { USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions'

// 🔹 State management
const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 🔸 UI and navigation state
const drawerOpen = ref(false)
const activeSection = ref('dashboard')
const activeSubSection = ref(null)

// 🔸 Data

let unsubscribeTests = null // Unsub function for real-time tests

// 🔹 Dynamic page title
const currentPageTitle = computed(() => {
  switch (activeSection.value) {
    case 'dashboard':
      return t('pages.navigation.dashboard')
    case 'studies':
      return t('pages.navigation.studies')
    case 'sessions':
      return t('pages.navigation.sessions')
    case 'templates':
      return t('pages.navigation.templates')
    case 'storage':
      return t('navigation.storage')
    case 'notifications':
      return t('pages.navigation.notifications')
    case 'profile':
      return t('pages.navigation.profile')
    case 'community':
      return activeSubSection.value === 'community-templates'
        ? t('pages.navigation.communityTemplates')
        : t('pages.navigation.communityStudies')
    default:
      return 'RUXAI Lab'
  }
})

// 🔹 Dynamic page icon
const currentPageIcon = computed(() => {
  switch (activeSection.value) {
    case 'dashboard':
      return 'mdi-view-dashboard'
    case 'studies':
      return 'mdi-flask'
    case 'sessions':
      return 'mdi-calendar-clock'
    case 'templates':
      return 'mdi-clipboard-text'
    case 'storage':
      return 'mdi-database'
    case 'notifications':
      return 'mdi-bell'
    case 'profile':
      return 'mdi-account-circle'
    case 'community':
      return activeSubSection.value === 'community-templates'
        ? 'mdi-file-document'
        : 'mdi-flask-outline'
    default:
      return 'mdi-view-dashboard'
  }
})

// 🔸 Vuex getters
const tests = computed(() => store.getters.tests || [])
const user = computed(() => store.getters.user)

/**
 * 🧮 Filters moderated sessions
 * Creates a list of sessions where the user is either the test admin
 * or a cooperator in a moderated session.
 */
const filteredModeratedSessions = computed(() => {
  const cooperatorArray = []
  if (!tests.value) return []

  tests.value.forEach((testObj) => {
    if (!testObj) return

    // User as cooperator
    const cooperatorObj = testObj.cooperators?.find(
      (coop) => coop.userDocId === user.value?.id,
    )
    if (cooperatorObj && testObj.subType === USER_STUDY_SUBTYPES.MODERATED) {
      cooperatorArray.push({
        ...cooperatorObj,
        testTitle: testObj.testTitle,
        testAdmin: testObj.testAdmin,
        id: testObj.id,
        testType: testObj.testType,
        subType: testObj.subType,
        testDescription: testObj.testDescription,
        evaluator: cooperatorObj.email,
      })
    }

    // User as test admin
    if (
      testObj.testAdmin?.userDocId === user.value?.id &&
      testObj.subType === USER_STUDY_SUBTYPES.MODERATED
    ) {
      testObj.cooperators?.forEach((coop) => {
        cooperatorArray.push({
          ...coop,
          testTitle: testObj.testTitle,
          testAdmin: testObj.testAdmin,
          id: testObj.id,
          testType: testObj.testType,
          subType: testObj.subType,
          evaluator: coop.email,
          testDescription: testObj.testDescription,
        })
      })
    }
  })

  return cooperatorArray
})

/**
 * 🧭 Navigation logic
 * Handles sidebar section changes.
 */
const selectNavigation = (navigationData) => {
  const { sectionId, childId } = navigationData
  router.push({
    query: {
      ...route.query,
      section: sectionId,
      subsection: childId || undefined,
    },
  })
}

/**
 * 🚀 Navigation helpers
 */
const goToCreateTestRoute = () => router.push('/choose')

/**
 * 🔄 Data fetching
 */
const getMyPersonalTests = () => store.dispatch('getTestsAdminByUser')
const getPublicStudies = () => store.dispatch('getPublicStudies')
const getMyTemplates = () => store.dispatch('getTemplatesOfUser')
const getPublicTemplates = () => store.dispatch('getPublicTemplates')

/**
 * 🧭 Route watcher
 * Loads data depending on the current section.
 */
watch([activeSection, activeSubSection], async ([section, sub]) => {
  switch (section) {
    case 'studies':
      await getMyPersonalTests()
      break
    case 'sessions':
      // filterModeratedSessions()
      break
    case 'templates':
      await getMyTemplates()
      break
    case 'storage':
      await getMyPersonalTests()
      break
    case 'community':
      if (sub === 'community-studies') await getPublicStudies()
      else if (sub === 'community-templates') await getPublicTemplates()
      break
  }
})

/**
 * 🧩 Lifecycle hooks
 */
onMounted(async () => {
  // unsubscribeTests = await store.dispatch('bindMyTests');
  await getMyPersonalTests()

  // Load navigation state from query params
  if (route.query.section) {
    activeSection.value = route.query.section
    if (route.query.subsection) {
      activeSubSection.value = route.query.subsection
    }
  }

  // Drawer toggle event listener (triggered from toolbar)
  window.addEventListener('toggle-dashboard-drawer', handleToggleDrawer)

  // Change section event listener
  globalThis.addEventListener('change-section', (event) => {
    activeSection.value = event.detail
  })
})

onUnmounted(() => {
  if (unsubscribeTests) unsubscribeTests()
  window.removeEventListener('toggle-dashboard-drawer', handleToggleDrawer)
})

/**
 * 🎛️ Event handler to toggle sidebar drawer
 */
const handleToggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
}

// Reacts to route query changes for section/subsection
watch(
  () => route.query.section,
  (newSection) => {
    if (newSection) activeSection.value = newSection
  },
  { immediate: true },
)

watch(
  () => route.query.subsection,
  (newSubSection) => {
    if (newSubSection) activeSubSection.value = newSubSection
  },
  { immediate: true },
)
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

.main-content {
  padding: 0;
  flex: 1;
  background-color: #fff;
}

.content-header {
  background-color: transparent;
  border-radius: 16px;
  padding: 1rem 0;
}
</style>
