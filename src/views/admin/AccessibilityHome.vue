<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Accessibility Dashboard</h1>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col 
        v-for="(card, index) in cards" 
        :key="index"
        cols="12" 
        sm="6" 
        md="4" 
        lg="3"
      >
        <v-card 
          class="h-100" 
          elevation="2" 
          @click="$router.push(card.route)"
        >
          <v-card-item>
            <v-card-title class="text-h6">
              <v-icon :icon="card.icon" class="mr-2"></v-icon>
              {{ card.title }}
            </v-card-title>
            <v-card-subtitle>{{ card.subtitle }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <p>{{ card.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const cards = ref([
  {
    title: 'Edit Test',
    icon: 'mdi-pencil',
    subtitle: 'Create and modify accessibility tests',
    description: 'Design and customize accessibility tests for your application.',
    route: '/admin/accessibility/edit-test'
  },
  {
    title: 'View Answer',
    icon: 'mdi-eye',
    subtitle: 'Review test responses and answers',
    description: 'Check and analyze the responses submitted for accessibility tests.',
    route: '/admin/accessibility/view-answer'
  },
  {
    title: 'Generate Report',
    icon: 'mdi-chart-box',
    subtitle: 'Create detailed accessibility reports',
    description: 'Generate comprehensive reports on accessibility test results and metrics.',
    route: '/admin/accessibility/generate-report'
  },
  {
    title: 'Cooperation',
    icon: 'mdi-account-group',
    subtitle: 'Team collaboration tools',
    description: 'Tools and features for team collaboration on accessibility tasks.',
    route: '/admin/accessibility/cooperation'
  },
  {
    title: 'Settings',
    icon: 'mdi-cog',
    subtitle: 'Configure accessibility settings',
    description: 'Customize and manage accessibility settings and preferences.',
    route: '/admin/accessibility/settings'
  },
  {
    title: 'Analytics',
    icon: 'mdi-chart-line',
    subtitle: 'View accessibility metrics',
    description: 'Access detailed analytics and insights about accessibility performance.',
    route: '/admin/accessibility/analytics'
  }
]);
</script>

<style scoped>
.v-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2) !important;
}

.h-100 {
  height: 100%;
}
</style>
