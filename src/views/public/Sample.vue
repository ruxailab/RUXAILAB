<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="rail = false">
      <v-list-item prepend-avatar="/human.svg" title="WCAG Accessibility" nav border>
        <template v-slot:append>
          <v-btn variant="text" icon="mdi-chevron-left" @click.stop="rail = !rail"></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item v-for="item in navItems" :key="item.value" :prepend-icon="item.icon" :title="item.title"
          :value="item.value" :to="item.route" @click="handleNavClick(item)"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <div class="sample-page">
        <!-- <AccessibilityQuiz /> -->
        <AccessibilityAssessment />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import AccessibilityQuiz from '@/components/AccessibilityQuiz.vue'
import AccessibilityAssessment from '@/components/organisms/AccessibilityAssessment.vue'
const drawer = ref(true)
const rail = ref(true)

const navItems = [
  {
    icon: 'mdi-home',
    title: 'AxeDashboard',
    value: 'AxeDashboard',
    route: '/dashboard',
  },
  {
    icon: 'mdi-check-circle',
    title: 'Assessment',
    value: 'assessment',
    route: '/assessment',
  },
  {
    icon: 'mdi-chart-box',
    title: 'Reports',
    value: 'reports',
    route: '/reports',
  },
  { icon: 'mdi-cog', title: 'Settings', value: 'settings', route: '/settings' },
]

//compute access level then deciding what goes into navItems

function handleNavClick(item) {
  if (item.route === '/assessment') {
    window.open(item.route, '_blank')
  }
  // For other items, default navigation will occur via :to
}
</script>

<style scoped>
.sample-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

p {
  color: #666;
  text-align: center;
  margin-bottom: 30px;
}
</style>
