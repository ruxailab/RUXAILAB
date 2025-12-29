<template>
  <v-navigation-drawer v-model="isOpen" temporary location="left" width="300" elevation="4" class="mobile-drawer">
    <!-- Header -->
    <div class="drawer-header pa-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <img src="@/assets/logo_full.png" alt="RUXAILAB" height="32" class="mr-3">
          <div>
            <h4 class="text-primary font-weight-bold">
              RUXAILAB
            </h4>
            <p class="text-caption text-medium-emphasis ma-0">
              UX Research Platform
            </p>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" color="primary" @click="closeDrawer" />
      </div>
    </div>

    <v-divider />

    <!-- User Section -->
    <div v-if="user" class="user-section pa-4">
      <div class="d-flex align-center">
        <v-avatar color="primary" size="40" class="mr-3">
          <v-img v-if="user.photoURL" :src="user.photoURL" alt="User Avatar" />
          <span v-else class="text-white font-weight-bold">
            {{ getUserInitials(user) }}
          </span>
        </v-avatar>
        <div class="flex-grow-1">
          <p class="text-body-2 font-weight-medium mb-0 text-primary">
            {{ user.displayName || user.email }}
          </p>
          <p class="text-caption text-medium-emphasis mb-0">
            {{ getAccessLevelText(userAccessLevel) }}
          </p>
        </div>
      </div>
    </div>

    <v-divider v-if="user" />

    <!-- Navigation Content -->
    <div class="drawer-content">
      <!-- Context-specific Navigation -->
      <div v-if="isInTest" class="test-context pa-4">
        <div class="context-header mb-3">
          <v-icon :icon="testIcon" color="primary" size="20" class="mr-2" />
          <span class="text-body-2 font-weight-bold text-primary">{{ testTitle }}</span>
        </div>

        <!-- Test Navigation Items -->
        <v-list class="test-nav-list" nav>
          <v-list-item v-for="item in filteredTestItems" :key="item.id" :title="item.title" :prepend-icon="item.icon"
            :active="activeStep === item.id" :disabled="item.disabled" class="nav-item" rounded="lg"
            @click="navigateToStep(item)">
            <template v-if="item.status" #append>
              <v-icon :icon="getStatusIcon(item.status)" :color="getStatusColor(item.status)" size="16" />
            </template>
          </v-list-item>
        </v-list>
      </div>

      <!-- Global Navigation -->
      <div class="global-context pa-4">
        <div v-if="isInTest" class="context-header mb-3">
          <v-icon icon="mdi-apps" color="primary" size="20" class="mr-2" />
          <span class="text-body-2 font-weight-bold text-primary">App Navigation</span>
        </div>

        <v-list class="global-nav-list" nav>
          <template v-for="item in globalNavigationItems" :key="item.id">
            <!-- Section Headers -->
            <div v-if="item.type === 'header'" class="section-header">
              <p class="text-caption text-medium-emphasis font-weight-bold px-2 py-1 ma-0">
                {{ item.title }}
              </p>
            </div>

            <!-- Navigation Items -->
            <v-list-item v-else :title="item.title" :subtitle="item.subtitle" :prepend-icon="item.icon"
              :active="activeSection === item.id" class="nav-item" rounded="lg" @click="navigateToSection(item)">
              <template v-if="item.badge" #append>
                <v-chip :color="item.badge.color" size="x-small" variant="flat">
                  {{ item.badge.text }}
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-list>
      </div>

      <!-- Action Buttons -->
      <div class="action-section pa-4 mt-auto">
        <v-btn v-if="!isInTest" color="primary" block size="large" prepend-icon="mdi-plus" rounded="lg"
          class="create-button mb-3" @click="createStudy">
          Create New Study
        </v-btn>

        <v-btn v-if="isInTest" variant="outlined" color="primary" block prepend-icon="mdi-arrow-left" rounded="lg"
          class="mb-3" @click="exitTest">
          Exit Test
        </v-btn>

        <v-btn v-if="user" variant="text" color="error" block prepend-icon="mdi-logout" rounded="lg" @click="signOut">
          Sign Out
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
  user: {
    type: Object,
    default: null
  },
  userAccessLevel: {
    type: String,
    default: 'basic'
  },
  activeSection: {
    type: String,
    default: null
  },
  activeStep: {
    type: String,
    default: null
  },
  isInTest: {
    type: Boolean,
    default: false
  },
  testType: {
    type: String,
    default: null
  },
  testTitle: {
    type: String,
    default: 'Test'
  }
});

// Emits
const emit = defineEmits([
  'update:modelValue',
  'navigate-section',
  'navigate-step',
  'create-test',
  'exit-test',
  'sign-out',
  'close'
]);

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

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

const filteredTestItems = computed(() => {
  if (!props.isInTest || !props.testType) return [];
  return getFilteredTestItems(props.testType, props.userAccessLevel);
});

// Methods
const closeDrawer = () => {
  emit('close');
  isOpen.value = false;
};

const navigateToSection = (item) => {
  emit('navigate-section', item);
  closeDrawer();
};

const navigateToStep = (item) => {
  if (!item.disabled) {
    emit('navigate-step', item);
    closeDrawer();
  }
};

const createStudy = () => {
  emit('create-test');
  closeDrawer();
};

const exitTest = () => {
  emit('exit-test');
  closeDrawer();
};

const signOut = () => {
  emit('sign-out');
  closeDrawer();
};

const getAccessLevelText = (level) => {
  const levelTexts = {
    basic: 'Basic User',
    premium: 'Premium User',
    admin: 'Administrator'
  };
  return levelTexts[level] || 'User';
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
.mobile-drawer {
  background-color: white !important;
}

.drawer-header {
  background-color: rgba(0, 33, 63, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.user-section {
  background-color: rgba(0, 33, 63, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.drawer-content {
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.test-context {
  background-color: rgba(0, 33, 63, 0.01);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.context-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.section-header {
  margin: 12px 0 8px 0;
}

.nav-item {
  transition: all 0.2s ease-in-out;
  margin-bottom: 4px;
  color: var(--v-primary-base, #00213F) !important;
}

.nav-item .v-list-item__prepend .v-icon {
  color: var(--v-primary-base, #00213F) !important;
}

.nav-item .v-list-item-title {
  color: var(--v-primary-base, #00213F) !important;
}

.nav-item.v-list-item--active {
  background-color: rgba(0, 33, 63, 0.15) !important;
  font-weight: 600 !important;
}

.nav-item:hover:not(.v-list-item--active):not(.v-list-item--disabled) {
  background-color: rgba(0, 33, 63, 0.05) !important;
  transform: translateX(4px);
}

.nav-item.v-list-item--disabled {
  opacity: 0.5;
}

.test-nav-list,
.global-nav-list {
  padding: 0 !important;
}

.action-section {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(0, 33, 63, 0.01);
}

.create-button {
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: 600 !important;
}

.action-section .v-btn {
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: 500 !important;
}
</style>
