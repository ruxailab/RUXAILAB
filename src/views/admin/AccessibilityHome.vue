<template>
  <v-app>
    <v-main>
      <v-container fluid class="dashboard-container">
        <!-- Header Section -->
        <v-row class="mb-8">
          <v-col cols="12">
            <div class="header-content">
              <h1 class="display-1 font-weight-bold text-primary mb-3">
                Accessibility Dashboard
              </h1>
              <p class="text-h6 text-medium-emphasis font-weight-regular">
                Manage and monitor your accessibility testing workflow
              </p>
            </div>
          </v-col>
        </v-row>

        <!-- Dashboard Cards -->
        <v-row class="dashboard-grid">
          <v-col
            v-for="(card, index) in cards"
            :key="index"
            cols="12"
            sm="6"
            md="6"
            lg="3"
          >
            <v-card
              class="dashboard-card"
              elevation="0"
              rounded="xl"
              hover
              @click="$router.push(card.route)"
              :style="{ 'animation-delay': `${index * 100}ms` }"
            >
              <v-card-text class="card-content">
                <div class="card-header mb-4">
                  <div 
                    class="icon-container"
                    :class="`icon-${card.title.toLowerCase()}`"
                  >
                    <v-icon 
                      :size="32" 
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
                  <p class="text-body-2 text-medium-emphasis mb-3 card-subtitle">
                    {{ card.subtitle }}
                  </p>
                  <p class="text-body-2 text-medium-emphasis card-description">
                    {{ card.description }}
                  </p>
                </div>

                <div class="card-footer mt-4">
                  <v-btn
                    variant="text"
                    size="small"
                    class="card-action-btn"
                    :ripple="false"
                  >
                    Open
                    <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
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
    title: 'Edit',
    icon: 'mdi-pencil-outline',
    subtitle: 'Create and modify tests',
    description: 'Design and customize accessibility tests for your application with advanced editing tools.',
    route: `/edit/${testId.value}`
  },
  {
    title: 'Preview',
    icon: 'mdi-eye-outline',
    subtitle: 'Review and preview tests',
    description: 'Preview your accessibility tests before deployment and review test configurations.',
    route: `/preview/${testId.value}`
  },
  {
    title: 'Answer',
    icon: 'mdi-comment-question-outline',
    subtitle: 'View test responses',
    description: 'Check and analyze the responses submitted for accessibility tests and evaluations.',
    route: `/result/${testId.value}`
  }
])
</script>

<style scoped>
/* Main Container */
.dashboard-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2rem 1rem;
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
  height: 100%;
  opacity: 0;
  animation: cardSlideIn 0.6s ease-out forwards;
}

.dashboard-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 1);
}

.card-content {
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: center;
}

.icon-container {
  width: 64px;
  height: 64px;
  border-radius: 16px;
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
}

.card-subtitle {
  font-weight: 500;
  color: #5a6c7d;
}

.card-description {
  line-height: 1.5;
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
@media (max-width: 960px) {
  .dashboard-container {
    padding: 1rem 0.5rem;
  }
  
  .display-1 {
    font-size: 2rem !important;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .icon-container {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 0.5rem;
  }
  
  .card-content {
    padding: 1rem;
  }
}
</style>