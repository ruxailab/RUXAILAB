<template>
  <div class="step-selector">
    <!-- Step Selector Button -->
    <v-tooltip location="top">
      <template #activator="{ props }">
        <v-btn 
          v-bind="props"
          :class="{ 'control-btn-active': showStepPanel, 'control-btn-enabled': !showStepPanel }" 
          class="control-btn" 
          icon 
          size="large"
          @click="toggleStepPanel"
        >
          <v-icon size="28">mdi-view-list</v-icon>
        </v-btn>
      </template>
      <span>{{ showStepPanel ? 'Hide steps' : 'Show steps' }}</span>
    </v-tooltip>

    <!-- Step Selection Panel -->
    <div class="step-panel" :class="{ 'step-panel-open': showStepPanel }">
      <div class="step-panel-header">
        <h3>Test Steps</h3>
        <v-btn 
          icon 
          size="small" 
          variant="text" 
          class="close-btn"
          @click="toggleStepPanel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      
      <div class="step-panel-content">
        <div class="current-step-info">
          <h4>Current Step</h4>
          <v-chip 
            color="primary" 
            size="large" 
            class="mb-3"
          >
            <v-icon start>mdi-play-circle</v-icon>
            Step {{ currentStep }} of {{ totalSteps }}
          </v-chip>
          <p class="step-description">{{ getCurrentStepDescription() }}</p>
        </div>

        <div class="steps-list">
          <h4>All Steps</h4>
          <div class="step-items">
            <div 
              v-for="(step, index) in steps" 
              :key="index"
              class="step-item"
              :class="{ 
                'step-item-current': index + 1 === currentStep,
                'step-item-completed': index + 1 < currentStep,
                'step-item-pending': index + 1 > currentStep
              }"
              @click="selectStep(index + 1)"
            >
              <div class="step-item-indicator">
                <v-icon 
                  v-if="index + 1 < currentStep" 
                  color="success" 
                  size="20"
                >
                  mdi-check-circle
                </v-icon>
                <v-icon 
                  v-else-if="index + 1 === currentStep" 
                  color="primary" 
                  size="20"
                >
                  mdi-play-circle
                </v-icon>
                <v-icon 
                  v-else 
                  color="grey" 
                  size="20"
                >
                  mdi-circle-outline
                </v-icon>
              </div>
              
              <div class="step-item-content">
                <div class="step-item-title">
                  Step {{ index + 1 }}
                </div>
                <div class="step-item-description">
                  {{ step.title }}
                </div>
              </div>
              
              <div v-if="index + 1 !== currentStep" class="step-item-action">
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click.stop="selectStep(index + 1)"
                >
                  {{ index + 1 < currentStep ? 'Revisit' : 'Go to' }}
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="step-controls">
          <v-btn
            color="success"
            size="large"
            block
            class="mb-2"
            :disabled="currentStep >= totalSteps"
            @click="proceedToNextStep"
          >
            <v-icon start>mdi-arrow-right</v-icon>
            {{ currentStep >= totalSteps ? 'Test Complete' : `Proceed to Step ${currentStep + 1}` }}
          </v-btn>
          
          <v-btn
            v-if="currentStep > 1"
            color="primary"
            size="large"
            block
            variant="outlined"
            @click="resetToFirstStep"
          >
            <v-icon start>mdi-restart</v-icon>
            Restart Test
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Overlay for panel (mobile) -->
    <div 
      v-if="showStepPanel" 
      class="step-panel-overlay"
      @click="toggleStepPanel"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  currentStep: {
    type: Number,
    default: 1
  },
  steps: {
    type: Array,
    default: () => [
      { title: 'Welcome & Instructions', description: 'Introduction to the test and initial setup' },
      { title: 'Task 1: Navigation', description: 'User navigates through the main interface' },
      { title: 'Task 2: Interaction', description: 'User performs specific interactions' },
      { title: 'Task 3: Completion', description: 'User completes the assigned tasks' },
      { title: 'Feedback & Wrap-up', description: 'Collect feedback and conclude the session' }
    ]
  }
});

// Emits
const emit = defineEmits([
  'stepSelected',
  'proceedToNextStep',
  'resetTest'
]);

// Reactive data
const showStepPanel = ref(false);

// Computed properties
const totalSteps = computed(() => props.steps.length);

// Methods
function toggleStepPanel() {
  showStepPanel.value = !showStepPanel.value;
}

function selectStep(stepNumber) {
  emit('stepSelected', stepNumber);
}

function proceedToNextStep() {
  emit('proceedToNextStep');
}

function resetToFirstStep() {
  emit('resetTest');
}

function getCurrentStepDescription() {
  const step = props.steps[props.currentStep - 1];
  return step ? step.description : 'No description available';
}
</script>

<style scoped>
.step-selector {
  position: relative;
}

/* Control button styles (inherit from parent) */
.control-btn {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.control-btn-enabled {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
}

.control-btn-enabled:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05) !important;
}

.control-btn-active {
  background: #1976d2 !important;
  color: white !important;
  border: 2px solid #1976d2 !important;
}

.control-btn-active:hover {
  background: #1565c0 !important;
  border-color: #1565c0 !important;
  transform: scale(1.05) !important;
}

/* Step Panel */
.step-panel {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  z-index: 1600;
  transition: right 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.step-panel-open {
  right: 0;
}

.step-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 2px solid #1976d2;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.step-panel-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  color: white !important;
}

.step-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.current-step-info {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #1976d2;
}

.current-step-info h4 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.step-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.steps-list h4 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.step-items {
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.step-item:hover {
  background: #f5f5f5;
  transform: translateX(4px);
}

.step-item-current {
  background: #e3f2fd;
  border-color: #1976d2;
}

.step-item-completed {
  background: #e8f5e8;
  border-color: #4caf50;
}

.step-item-pending {
  background: #f9f9f9;
  border-color: #e0e0e0;
}

.step-item-indicator {
  flex: 0 0 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.step-item-content {
  flex: 1;
}

.step-item-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 4px;
}

.step-item-description {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
}

.step-item-action {
  flex: 0 0 auto;
}

.step-controls {
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

/* Panel overlay for mobile */
.step-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1500;
  display: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .step-panel {
    width: 100%;
    right: -100%;
  }
  
  .step-panel-overlay {
    display: block;
  }
  
  .step-panel-content {
    padding: 16px;
  }
  
  .current-step-info {
    padding: 16px;
    margin-bottom: 24px;
  }
}

@media (max-width: 480px) {
  .step-item {
    padding: 12px;
  }
  
  .step-item-indicator {
    margin-right: 12px;
  }
}
</style>