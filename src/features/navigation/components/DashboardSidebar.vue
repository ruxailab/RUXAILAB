<template>
  <v-navigation-drawer
    v-model="drawerState"
    width="280"
    class="sidebar"
    elevation="0"
    :permanent="!isMobile"
    :temporary="isMobile"
  >
    <!-- Navigation Items -->
    <v-list
      class="pa-4"
      nav
    >
      <template
        v-for="item in navigationItems"
        :key="item.id"
      >
        <v-list-group
          v-if="item.children"
          :value="activeSection === item.id"
        >
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.icon"
              :title="item.title"
              class="section-header mb-2"
              rounded="lg"
            />
          </template>
          <v-list-item
            v-for="child in item.children"
            :key="child.id"
            :title="child.title"
            :prepend-icon="child.icon"
            :active="activeSection === item.id && activeSubSection === child.id"
            class="subsection-item ml-4 mb-1"
            rounded="lg"
            @click="selectNavigation(item.id, child.id)"
          />
        </v-list-group>

        <v-list-item
          v-else
          :title="item.title"
          :prepend-icon="item.icon"
          :active="activeSection === item.id"
          class="section-header mb-2"
          rounded="lg"
          @click="selectNavigation(item.id)"
        />
      </template>
    </v-list>

    <!-- Create Button -->
    <div class="px-4 pb-4 mt-auto">
      <v-btn
        color="primary"
        block
        size="large"
        prepend-icon="mdi-plus"
        rounded="lg"
        elevation="1"
        class="create-button"
        @click="$emit('create-test')"
      >
  {{ $t('Dashboard.createNewTest') }}
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { dashboardNavigationItems } from '@/features/dashboard';

// Composables
const { mobile } = useDisplay();

// Props
const props = defineProps({
    activeSection: {
        type: String,
        default: 'dashboard'
    },
    activeSubSection: {
        type: String,
        default: null
    },
    modelValue: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['navigate', 'create-test', 'update:modelValue']);

// Computed
const isMobile = computed(() => mobile.value);
const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

// Para el drawer: en desktop siempre true, en mobile controlado por modelValue
const drawerState = computed({
    get: () => {
        return isMobile.value ? props.modelValue : true;
    },
    set: (value) => {
        if (isMobile.value) {
            emit('update:modelValue', value);
        }
    }
});

// Data
const navigationItems = dashboardNavigationItems;

// Methods
const selectNavigation = (sectionId, childId = null) => {
  emit('navigate', { sectionId, childId })
  if (isMobile.value) {
    emit('update:modelValue', false)
  }
};
</script>

<style scoped>
.sidebar {
    background-color: white !important;
    border-right: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.sidebar-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo {
    transition: transform 0.3s ease-in-out;
}

.sidebar-header:hover .logo {
    transform: scale(1.05);
}

.create-button {
    text-transform: none !important;
    letter-spacing: normal !important;
    font-weight: 600 !important;
    transition: transform 0.2s ease-in-out !important;
}

.create-button:hover {
    transform: translateY(-2px);
}

/* Navigation Styling */
.v-list {
    padding: 0.5rem !important;
}

.v-list-group__items .v-list-item {
    margin-bottom: 4px;
    transition: all 0.2s ease-in-out;
}

.v-list-group__items .v-list-item.v-list-item--active {
    background-color: var(--v-primary-lighten-5, rgba(0, 33, 63, 0.1)) !important;
    color: var(--v-primary-base, #00213F) !important;
    font-weight: 600 !important;
}

.v-list-group__items .v-list-item.v-list-item--active .v-list-item__prepend .v-icon {
    color: var(--v-primary-base, #00213F) !important;
}

.v-list-group__items .v-list-item:hover:not(.v-list-item--active) {
    background-color: rgba(0, 0, 0, 0.03) !important;
    transform: translateX(4px);
}

.section-header {
    font-weight: 600 !important;
    border-radius: 8px;
    margin-bottom: 4px;
}

.section-header .v-list-item__prepend .v-icon {
    margin-right: 12px;
    transition: transform 0.2s ease-in-out;
}

.section-header:hover .v-list-item__prepend .v-icon {
    transform: scale(1.1);
}

.subsection-item {
    font-size: 0.9rem;
    padding: 0;
    opacity: 0.85;
    transition: opacity 0.2s ease-in-out;
}

.subsection-item:hover {
    opacity: 1;
}

.subsection-item .v-list-item__prepend .v-icon {
    font-size: 18px;
    margin-right: 12px;
}
</style>
