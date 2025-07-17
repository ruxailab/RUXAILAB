<template>
  <v-app>
    <v-main>
      <v-container fluid class="dashboard-container">
        <!-- Dashboard Cards -->
        <v-row class="dashboard-grid" no-gutters>
          <v-col
            v-for="(card, index) in cards"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            xl="2"
            class="pa-2"
          >
            <v-card
              class="dashboard-card"
              elevation="2"
              rounded="xl"
              hover
              @click="$router.push(card.route)"
              :style="{ 'animation-delay': `${index * 100}ms` }"
            >
              <v-card-text class="card-content">
                <div class="card-header mb-3">
                  <div 
                    class="icon-container"
                    :class="`icon-${card.title.toLowerCase()}`"
                  >
                    <v-icon 
                      :size="28" 
                      class="card-icon"
                      color="white"
                    >
                      {{ card.icon }}
                    </v-icon>
                  </div>
                </div>
                
                <div class="card-body">
                  <h4 class="text-h6 font-weight-bold mb-2 card-title">
                    {{ card.title }}
                  </h4>
                  <p class="text-body-2 text-medium-emphasis mb-2 card-subtitle">
                    {{ card.subtitle }}
                  </p>
                  <p class="text-caption text-medium-emphasis card-description">
                    {{ card.description }}
                  </p>
                </div>

                <div class="card-footer mt-3">
                  <v-btn
                    variant="text"
                    size="small"
                    class="card-action-btn"
                    :ripple="false"
                  >
                    Open
                    <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router';
const route = useRoute()
const testId = ref(route.params.testId || '');
const cards = ref([
  {
    title: 'Home',
    icon: 'mdi-home-variant',
    subtitle: 'Dashboard overview',
    description: 'Access your main dashboard with overview of all accessibility activities and metrics.',
    route: ''
  },
  {
    title: 'Config',
    icon: 'mdi-cog-outline',
    subtitle: 'Configuration settings',
    description: 'Configure and manage accessibility test settings, preferences, and system configurations.',
    route: `/config/${testId.value}`
  },
  {
    title: 'Edit',
    icon: 'mdi-pencil-outline',
    subtitle: 'Create and modify tests',
    description: 'Design and customize accessibility tests for your application with advanced editing tools.',
    route: `/edit/${testId.value}`
  },
  {
    title: 'Preview',
    icon: 'mdi-eye-outline',
    subtitle: 'Preview tests',
    description: 'Preview your accessibility tests before deployment and review test configurations.',
    route: `/preview/${testId.value}`
  },
  {
    title: 'Answer',
    icon: 'mdi-comment-question-outline',
    subtitle: 'View test responses',
    description: 'Check and analyze the responses submitted for accessibility tests and evaluations.',
    route: `/result/${testId.value}`
  },
])
</script>

<style scoped>
/* Main Container */
.dashboard-container {
  background: #f8f9fa;
  min-height: 120vh;
  padding: 1.5rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.header-content {
  text-align: center;
  animation: slideInDown 0.8s ease-out;
}

/* Dashboard Cards */
.dashboard-grid {
  animation: fadeInUp 0.6s ease-out;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  height: 240px;
  opacity: 0;
  animation: cardSlideIn 0.6s ease-out forwards;
}

.dashboard-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 1);
}

.card-content {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: center;
}

.icon-container {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.icon-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border-radius: inherit;
}

.icon-home { background: linear-gradient(135deg, #667eea, #764ba2); }
.icon-edit { background: linear-gradient(135deg, #f093fb, #f5576c); }
.icon-preview { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.icon-answer { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.icon-config { background: linear-gradient(135deg, #fa709a, #fee140); }

.card-icon {
  position: relative;
  z-index: 1;
}

.card-body {
  flex: 1;
  text-align: center;
}

.card-title {
  color: #2c3e50;
  font-size: 1.1rem !important;
}

.card-subtitle {
  font-weight: 500;
  color: #5a6c7d;
  font-size: 0.875rem !important;
}

.card-description {
  line-height: 1.4;
  font-size: 0.75rem !important;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  text-align: center;
}

.card-action-btn {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.dashboard-card:hover .card-action-btn {
  opacity: 1;
  transform: translateY(0);
}

/* Animations */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1280px) {
  .dashboard-card {
    height: 260px;
  }
  .card-content {
    padding: 1.25rem;
  }
}

@media (max-width: 960px) {
  .dashboard-container {
    padding: 1rem 0.5rem;
  }
  
  .display-1 {
    font-size: 2rem !important;
  }
  
  .dashboard-card {
    height: 240px;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .icon-container {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 0.5rem;
  }
  
  .dashboard-card {
    height: 220px;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .icon-container {
    width: 44px;
    height: 44px;
  }
  
  .card-title {
    font-size: 1rem !important;
  }
  
  .card-subtitle {
    font-size: 0.8rem !important;
  }
  
  .card-description {
    font-size: 0.7rem !important;
  }
}

/* Ensure cards fit properly on smaller screens */
@media (max-width: 450px) {
  .dashboard-card {
    height: 200px;
  }
  
  .card-content {
    padding: 0.75rem;
  }
}
</style>