<template>
  <v-app>
    <AccessibilityDrawer
      ref="accessibilityDrawer"
      v-model="drawerOpen"
      :items="navItems"
      @toggle="onDrawerToggle"
    />
    <v-main
      
    >

              <router-view />
         
       

    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AccessibilityDrawer from '@/ux/accessibility/components/atoms/AccessibilityDrawer.vue'

const route = useRoute()
const testId = ref(route.params.id || '')
const accessibilityDrawer = ref(null)
const drawerOpen = ref(false)

// Navigation items for the drawer
const navItems = computed(() => [
    {
        title: 'Manager',
        icon: 'mdi-home',
        path: `/accessibility/automatic/${testId.value}`
    },
    {
        title: 'Analyse',
        icon: 'mdi-magnify',
        path: `/accessibility/automatic/analyse/${testId.value}`
    },
    {
        title: 'Answers',
        icon: 'mdi-order-bool-ascending-variant',
        path: `/accessibility/automatic/answers/${testId.value}`
    },
    {
        title: 'Report',
        icon: 'mdi-chart-bar',
        path: `/accessibility/automatic/reports/${testId.value}`
    },
    {
        title: 'Settings',
        icon: 'mdi-cog',
        path: `/accessibility/automatic/settings/${testId.value}`
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

// drawer closed when open
onMounted(() => {
    onDrawerToggle(false) // Assuming drawer starts closed by default
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