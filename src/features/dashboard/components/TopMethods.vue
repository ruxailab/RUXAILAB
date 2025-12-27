<template>
  <v-card
    elevation="1"
    elevation-hover="2"
    rounded="lg"
    class="top-methods-card position-relative"
  >
    <!-- Coming Soon Chip -->
    <v-chip
      class="coming-soon-chip"
      color="primary"
      variant="outlined"
      size="small"
      :prepend-icon="showClockIcon ? 'mdi-clock-outline' : undefined"
    >
      <span class="chip-text">Coming Soon</span>
    </v-chip>

    <v-card-title class="card-header d-flex align-center py-3 py-md-4 px-3 px-md-4">
      <div class="d-flex align-center justify-space-between w-100">
        <span class="title-text text-h6 text-md-h5 font-weight-bold">Most used methods</span>
      </div>
    </v-card-title>

    <v-card-text class="card-content pa-3 pa-md-4">
      <!-- Coming Soon Overlay -->
      <div class="coming-soon-overlay"></div>
      
      <div class="methods-list">
        <div
          v-for="method in topMethods"
          :key="method.id"
          class="method-item"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center method-left">
              <div
                class="method-icon-wrapper mr-2 mr-md-3"
                :style="{ backgroundColor: method.bgColor + '33' }"
              >
                <v-icon
                  :icon="method.icon"
                  :color="method.color"
                  size="small"
                  class="method-icon"
                />
              </div>
              <div class="method-info flex-grow-1">
                <div class="method-name">
                  {{ truncateMethodName(method.name) }}
                </div>
                <div class="method-type">
                  {{ truncateMethodType(method.type) }}
                </div>
              </div>
            </div>
            <div class="usage-stats ml-1 ml-md-2">
              <v-chip
                :color="method.color"
                variant="tonal"
                size="small"
                class="usage-chip"
              >
                <span class="usage-text">{{ formatUsage(method.usage) }}</span>
              </v-chip>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="d-flex flex-column align-center justify-center fill-height pa-4 text-center">
        <v-icon
          icon="mdi-chart-bar-off"
          size="48"
          color="grey-lighten-2"
          class="mb-2"
        />
        <div class="text-body-1 text-grey-darken-1">No data available yet</div>
        <div class="text-caption text-grey">Create your first study to see statistics here.</div>
      </div>

    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    methodsData: {
        type: Array,
        default: () => []
    }
})

// Reactive window width for responsive calculations
const windowWidth = ref(window.innerWidth)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

// Responsive computed properties
const showClockIcon = computed(() => {
  return windowWidth.value >= 380
})

const truncateMethodName = (name) => {
  if (!name) return ''
  if (windowWidth.value >= 600) return name
  
  // Truncate for mobile
  const maxLength = windowWidth.value < 400 ? 15 : 20
  if (name.length <= maxLength) return name
  return name.substring(0, maxLength) + '...'
}

const truncateMethodType = (type) => {
  if (!type) return ''
  if (windowWidth.value >= 600) return type
  
  // Truncate for mobile
  const maxLength = windowWidth.value < 400 ? 12 : 18
  if (type.length <= maxLength) return type
  return type.substring(0, maxLength) + '...'
}

const formatUsage = (usage) => {
  if (windowWidth.value < 400) {
    // Show abbreviated version on very small screens
    return usage.replace('k', 'K')
  }
  return usage + ' Uses'
}

const topMethods = computed(() => {
    return props.methodsData.slice(0, 5)
})
</script>

<style scoped>
.top-methods-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* Coming Soon Chip */
.coming-soon-chip {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 20;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(var(--v-theme-primary), 0.3);
    pointer-events: none;
}

.chip-text {
    font-size: 0.7rem;
    font-weight: 500;
}

.card-header {
    border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.1);
    min-height: 56px;
    position: relative;
    z-index: 15;
    background-color: rgb(var(--v-theme-background));
}

.title-text {
    font-size: 1.125rem;
    line-height: 1.3;
}

.card-content {
    flex: 1;
    overflow-y: auto;
    position: relative;
    min-height: 300px;
}

/* Coming Soon Overlay */
.coming-soon-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(248, 249, 250, 0.8);
    backdrop-filter: blur(0.5px);
    border-radius: 0 0 12px 12px;
    z-index: 10;
    pointer-events: none;
    user-select: none;
}

.methods-list {
    position: relative;
    z-index: 5;
}

.method-item {
    padding: 10px 0;
    border-bottom: 1px solid rgba(var(--v-theme-surface-variant), 0.2);
}

.method-item:last-child {
    border-bottom: none;
}

.method-left {
    flex: 1;
    min-width: 0;
}

.method-icon-wrapper {
    border-radius: 10px;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    flex-shrink: 0;
}

.method-icon {
    font-size: 18px;
}

.method-info {
    overflow: hidden;
}

.method-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: rgb(var(--v-theme-on-surface));
    line-height: 1.2;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.method-type {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.usage-stats {
    flex-shrink: 0;
}

.usage-chip {
    font-weight: 600;
    min-width: 70px;
    justify-content: center;
}

.usage-text {
    font-size: 0.7rem;
    white-space: nowrap;
}

/* Mobile-first responsive design */
@media (max-width: 600px) {
    .coming-soon-chip {
        top: 8px;
        right: 8px;
        padding: 2px 6px;
        height: 24px;
    }
    
    .chip-text {
        font-size: 0.65rem;
    }
    
    .card-header {
        min-height: 48px;
        padding: 12px 16px !important;
    }
    
    .title-text {
        font-size: 1rem;
    }
    
    .method-item {
        padding: 8px 0;
    }
    
    .method-icon-wrapper {
        min-width: 32px;
        height: 32px;
        padding: 5px;
        border-radius: 8px;
    }
    
    .method-icon {
        font-size: 16px;
    }
    
    .method-name {
        font-size: 0.8rem;
    }
    
    .method-type {
        font-size: 0.7rem;
    }
    
    .usage-chip {
        min-width: 60px;
        padding: 0 6px;
        height: 24px;
    }
    
    .usage-text {
        font-size: 0.65rem;
    }
}

/* Very small devices (below 380px) */
@media (max-width: 410px) {
    .coming-soon-chip {
        top: 6px;
        right: 6px;
        padding: 1px 4px;
        height: 22px;
        max-width: 75px;
    }
    
    .chip-text {
        font-size: 0.6rem;
    }
    
    /* Hide clock icon on very small screens */
    :deep(.coming-soon-chip .v-chip__prepend) {
        display: none !important;
    }
    
    .coming-soon-chip {
        justify-content: center !important;
    }
    
    .card-header {
        padding: 10px 12px !important;
        min-height: 44px;
    }
    
    .title-text {
        font-size: 0.875rem;
        padding-right: 60px;
        max-width: calc(100% - 60px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .method-icon-wrapper {
        min-width: 28px;
        height: 28px;
        padding: 4px;
    }
    
    .method-icon {
        font-size: 14px;
    }
    
    .method-name {
        font-size: 0.75rem;
    }
    
    .method-type {
        font-size: 0.65rem;
    }
    
    .usage-chip {
        min-width: 50px;
        padding: 0 4px;
        height: 22px;
    }
    
    .usage-text {
        font-size: 0.6rem;
    }
}

/* Extreme small devices */
@media (max-width: 320px) {
    .coming-soon-chip {
        max-width: 60px;
    }
    
    .chip-text {
        font-size: 0.55rem;
    }
    
    .title-text {
        font-size: 0.8rem;
        padding-right: 50px;
        max-width: calc(100% - 50px);
    }
    
    .method-icon-wrapper {
        min-width: 24px;
        height: 24px;
    }
    
    .method-icon {
        font-size: 12px;
    }
    
    .method-name {
        font-size: 0.7rem;
    }
    
    .method-type {
        font-size: 0.6rem;
    }
    
    .usage-chip {
        min-width: 45px;
        height: 20px;
    }
    
    .usage-text {
        font-size: 0.55rem;
    }
}

/* Tablet */
@media (min-width: 601px) and (max-width: 960px) {
    .card-header {
        min-height: 52px;
    }
    
    .title-text {
        font-size: 1.25rem;
    }
    
    .method-icon-wrapper {
        min-width: 40px;
        height: 40px;
    }
    
    .method-icon {
        font-size: 20px;
    }
    
    .method-name {
        font-size: 0.9rem;
    }
    
    .method-type {
        font-size: 0.8rem;
    }
    
    .usage-chip {
        min-width: 80px;
    }
    
    .usage-text {
        font-size: 0.75rem;
    }
}

/* Desktop */
@media (min-width: 961px) {
    .top-methods-card {
        min-height: 500px;
    }
    
    .card-header {
        min-height: 60px;
    }
    
    .title-text {
        font-size: 1.5rem;
    }
    
    .method-icon-wrapper {
        min-width: 44px;
        height: 44px;
        border-radius: 12px;
        padding: 8px;
    }
    
    .method-icon {
        font-size: 22px;
    }
    
    .method-name {
        font-size: 1rem;
    }
    
    .method-type {
        font-size: 0.85rem;
    }
    
    .usage-chip {
        min-width: 90px;
        padding: 0 10px;
        height: 28px;
    }
    
    .usage-text {
        font-size: 0.8rem;
    }
}

/* Handle landscape orientation */
@media (max-height: 600px) and (orientation: landscape) {
    .top-methods-card {
        min-height: 400px;
    }
    
    .method-item {
        padding: 6px 0;
    }
}

/* Ensure touch-friendly targets */
@media (max-width: 960px) {
    .method-icon-wrapper {
        min-width: 32px;
        min-height: 32px;
    }
    
    .usage-chip {
        min-height: 24px;
        min-width: 50px;
    }
}
</style>