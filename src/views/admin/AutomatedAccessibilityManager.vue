<template>
    <v-app>
        <v-main class="fill-height" style="background-color: #f5f5f5;">
            <v-container fluid class="fill-height pa-0 ma-0">
                <v-row no-gutters class="fill-height">
                    <!-- Drawer Component -->
                    <AccessibilityDrawer ref="accessibilityDrawer" :items="navItems" v-model="drawerOpen"
                        @toggle="onDrawerToggle" />

                    <!-- Main Content -->
                    <v-col class="pa-4 content-col">
                        <v-card class="fill-height pa-4" style="background-color: #ffffff;">
                            <router-view />
                        </v-card>
                    </v-col>
                </v-row>
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
        path: `/accessibility/automatic/${testId.value}`
    },
    {
        title: 'Analyse',
        icon: 'mdi-magnify',
        path: `/analyse/${testId.value}`
    },
    {
        title: 'Answers',
        icon: 'mdi-comment-question',
        path: `/answers/${testId.value}`
    },
    {
        title: 'Report',
        icon: 'mdi-chart-bar',
        path: `/report/${testId.value}`
    },
    {
        title: 'Settings',
        icon: 'mdi-cog',
        path: `/settings/${testId.value}`
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