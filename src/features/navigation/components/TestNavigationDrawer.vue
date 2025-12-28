<template>
  <v-navigation-drawer v-model="isOpen" :width="drawerWidth" :temporary="isMobile" :permanent="!isMobile && isPermanent"
    :location="isMobile ? 'left' : 'right'" elevation="0" class="test-drawer">
    <!-- Test Header -->
    <div class="test-header pa-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon :icon="testIcon" color="primary" size="24" class="mr-3" />
          <div>
            <h4 class="text-primary font-weight-bold">
              {{ testTitle }}
            </h4>
            <p class="text-caption text-medium-emphasis ma-0">
              {{ testDescription }}
            </p>
          </div>
        </div>
        <v-btn v-if="isMobile" icon="mdi-close" variant="text" size="small" @click="closeDrawer" />
      </div>
    </div>

    <v-divider />

    <!-- Navigation Content -->
    <div class="drawer-content">
      <!-- Test Progress -->
      <div v-if="showProgress" class="progress-section pa-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-body-2 font-weight-medium">Progress</span>
          <span class="text-caption text-primary">{{ currentStep }}/{{ totalSteps }}</span>
        </div>
        <v-progress-linear :model-value="progressPercentage" color="primary" height="8" rounded class="mb-2" />
        <p class="text-caption text-medium-emphasis">
          {{ progressDescription }}
        </p>
      </div>

      <!-- Navigation Items -->
      <v-list class="pa-4" nav>
        <template v-for="item in filteredNavigationItems" :key="item.id">
          <!-- Section Headers -->
          <div v-if="item.type === 'header'" class="section-divider">
            <v-divider class="my-2" />
            <p class="text-caption text-medium-emphasis font-weight-bold px-4 py-2">
              {{ item.title }}
            </p>
          </div>

          <!-- Navigation Items -->
          <v-list-item v-else :title="item.title" :subtitle="item.subtitle" :prepend-icon="item.icon"
            :active="activeStep === item.id" :disabled="item.disabled" class="nav-item mb-1" rounded="lg"
            @click="navigateToStep(item)">
            <template v-if="item.status" #append>
              <v-icon :icon="getStatusIcon(item.status)" :color="getStatusColor(item.status)" size="18" />
            </template>
          </v-list-item>
        </template>
      </v-list>

      <!-- Action Buttons -->
      <div class="action-buttons pa-4 mt-auto">
        <v-btn v-if="canGoBack" variant="outlined" color="primary" block class="mb-2" prepend-icon="mdi-arrow-left"
          @click="goBack">
          Previous Step
        </v-btn>

        <v-btn v-if="canGoNext" color="primary" block class="mb-2" append-icon="mdi-arrow-right" @click="goNext">
          Next Step
        </v-btn>

        <v-btn v-if="canFinish" color="success" block prepend-icon="mdi-check" @click="finishTest">
          Finish Test
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  testType: {
    type: String,
    required: true
  },
  testTitle: {
    type: String,
    default: 'Test'
  },
  testDescription: {
    type: String,
    default: ''
  },
  activeStep: {
    type: String,
    default: null
  },
  currentStep: {
    type: Number,
    default: 1
  },
  totalSteps: {
    type: Number,
    default: 1
  },
  userAccessLevel: {
    type: String,
    default: 'basic'
  },
  isPermanent: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  canGoBack: {
    type: Boolean,
    default: false
  },
  canGoNext: {
    type: Boolean,
    default: false
  },
  canFinish: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits([
  'update:modelValue',
  'navigate',
  'go-back',
  'go-next',
  'finish-test',
  'close'
]);

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const drawerWidth = computed(() => props.isMobile ? 300 : 350);

const testIcon = computed(() => {
  const typeIcons = {
    heuristic: 'mdi-magnify',
    automatic: 'mdi-robot',
    tree: 'mdi-file-tree',
    'card-sorting': 'mdi-card-multiple',
    'first-click': 'mdi-cursor-default-click',
    'five-second': 'mdi-timer-5'
  };
  return typeIcons[props.testType] || 'mdi-test-tube';
});

const progressPercentage = computed(() => {
  return props.totalSteps > 0 ? (props.currentStep / props.totalSteps) * 100 : 0;
});

const progressDescription = computed(() => {
  if (props.currentStep === props.totalSteps) {
    return 'Test completed!';
  }
  return `Step ${props.currentStep} of ${props.totalSteps}`;
});

const filteredNavigationItems = computed(() => {
  return getFilteredTestItems(props.testType, props.userAccessLevel);
});

// Methods
const navigateToStep = (item) => {
  if (!item.disabled) {
    emit('navigate', item);
  }
};

const goBack = () => {
  emit('go-back');
};

const goNext = () => {
  emit('go-next');
};

const finishTest = () => {
  emit('finish-test');
};

const closeDrawer = () => {
  emit('close');
  isOpen.value = false;
};

const getStatusIcon = (status) => {
  const statusIcons = {
    completed: 'mdi-check-circle',
    current: 'mdi-play-circle',
    pending: 'mdi-clock-outline',
    error: 'mdi-alert-circle'
  };
  return statusIcons[status] || 'mdi-circle-outline';
};

const getStatusColor = (status) => {
  const statusColors = {
    completed: 'success',
    current: 'primary',
    pending: 'grey',
    error: 'error'
  };
  return statusColors[status] || 'grey';
};
</script>

<style scoped>
.test-drawer {
  background-color: white !important;
  border-left: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.test-header {
  background-color: rgba(0, 33, 63, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.drawer-content {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.progress-section {
  background-color: rgba(0, 33, 63, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.section-divider {
  margin: 12px 0;
}

.nav-item {
  transition: all 0.2s ease-in-out;
  margin-bottom: 4px;
}

.nav-item.v-list-item--active {
  background-color: rgba(0, 33, 63, 0.1) !important;
  color: var(--v-primary-base, #00213F) !important;
  font-weight: 600 !important;
}

.nav-item.v-list-item--active .v-list-item__prepend .v-icon {
  color: var(--v-primary-base, #00213F) !important;
}

.nav-item:hover:not(.v-list-item--active):not(.v-list-item--disabled) {
  background-color: rgba(0, 0, 0, 0.03) !important;
  transform: translateX(-4px);
}

.nav-item.v-list-item--disabled {
  opacity: 0.5;
}

.action-buttons {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(0, 33, 63, 0.01);
}

.action-buttons .v-btn {
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: 600 !important;
}
</style>
