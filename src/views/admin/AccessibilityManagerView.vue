<template>
  <v-app>
    <AccessibilityDrawer
      ref="accessibilityDrawer"
      :items="navItems"
      v-model="drawerOpen"
      @toggle="onDrawerToggle"
    />

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AccessibilityDrawer from '@/components/atoms/AccessibilityDrawer.vue'

const route = useRoute()
const testId = ref(route.params.testId || '')
const accessibilityDrawer = ref(null)
const drawerOpen = ref(false)

// Navigation items for the drawer
const navItems = computed(() => [
  {
    title: 'Home',
    icon: 'mdi-home',
    path: `/accessibility/manual/${testId.value}`,
  },
   {
    title: 'Config',
    icon: 'mdi-cog',
    path: `/config/${testId.value}`,
  },
  {
    title: 'Edit Test',
    icon: 'mdi-pencil',
    path: `/edit/${testId.value}`,
  },
  {
    title: 'Preview',
    icon: 'mdi-clipboard-check',
    path: `/preview/${testId.value}`,
  },
  {
    title: 'Answers',
    icon: 'mdi-comment-question',
    path: `/result/${testId.value}`,
  },
 
])

const onDrawerToggle = (isOpen) => {
  const contentCol = document.querySelector('.content-col')
  if (contentCol) {
    if (isOpen) {
      contentCol.style.marginLeft = '256px'
      contentCol.style.width = 'calc(100% - 256px)'
    } else {
      contentCol.style.marginLeft = '56px'
      contentCol.style.width = 'calc(100% - 56px)'
    }
  }
}

// Initialize the content area position
onMounted(() => {
  // Initial position based on the drawer's default state
  onDrawerToggle(true) // Assuming drawer starts open by default
})
</script>

<style scoped>
.fill-height {
  height: 100vh;
  overflow: hidden;
}

/* Content area styles */
.content-col {
  margin-left: 256px;
  /* Default to drawer open */
  width: calc(100% - 256px);
  height: 100%;
  transition: margin 0.3s ease, width 0.3s ease;
  overflow-y: auto;
  padding: 16px !important;
}

/* Ensure proper spacing for the drawer */
:deep(.v-navigation-drawer) {
  position: fixed;
  z-index: 100;
  height: 100vh;
  overflow-y: auto;
}

/* Adjust for mobile */
@media (max-width: 960px) {
  .content-col {
    margin-left: 56px !important;
    width: calc(100% - 56px) !important;
  }
}
</style>
