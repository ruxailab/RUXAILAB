<template>
  <v-card
    elevation="2"
    rounded="lg"
    class="top-methods-card position-relative"
  >
    <!-- Coming Soon Chip -->
    <v-chip
      class="coming-soon-chip"
      color="primary"
      variant="outlined"
      size="small"
      prepend-icon="mdi-clock-outline"
    >
      Coming Soon
    </v-chip>

    <v-card-title class="d-flex align-center py-4">

      <div class="d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-bold">Most used methods</span>
      
      </div>
    </v-card-title>

    <v-card-text class="pa-4 coming-soon-overlay">
      <div class="methods-list">
        <div
          v-for="method in topMethods"
          :key="method.id"
          class="method-item"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <div
                class="method-icon-wrapper mr-3"
                :style="{ backgroundColor: method.bgColor + '33' }"
              >
                <v-icon
                  :icon="method.icon"
                  :color="method.color"
                  size="24"
                />
              </div>
              <div class="method-info">
                <div class="method-name">
                  {{ method.name }}
                </div>
                <div>{{ method.type }}</div>
              </div>
            </div>
            <div class=" usage-stats">
              <v-chip
                :color="method.color"
                variant="tonal"
                size="small"
                class="usage-chip"
              >
                {{ method.usage }} Uses
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    methodsData: {
        type: Array,
        default: () => []
    }
})

const topMethods = computed(() => {
    if (props.methodsData.length > 0) {
        return props.methodsData.slice(0, 5)
    }

    // Default top methods data
    return [
        {
            id: 1,
            name: 'Heuristic Evaluation',
            type: 'Expert Review',
            icon: 'mdi-eye-check',
            color: 'purple',
            bgColor: '#9c27b0',
            usage: '2.3k'
        },
        {
            id: 2,
            name: 'User Interview',
            type: 'Qualitative Research',
            icon: 'mdi-account-voice',
            color: 'cyan',
            bgColor: '#00bcd4',
            usage: '1.8k'
        },
        {
            id: 3,
            name: 'A/B Testing',
            type: 'Quantitative Test',
            icon: 'mdi-flask',
            color: 'green',
            bgColor: '#4caf50',
            usage: '1.5k'
        },
        {
            id: 4,
            name: 'Card Sorting',
            type: 'Information Architecture',
            icon: 'mdi-card-multiple',
            color: 'orange',
            bgColor: '#ff9800',
            usage: '1.2k'
        },
        {
            id: 5,
            name: 'Usability Testing',
            type: 'User Testing',
            icon: 'mdi-account-check',
            color: 'pink',
            bgColor: '#e91e63',
            usage: '967'
        }
    ]
})
</script>

<style scoped>
.top-methods-card {
    height: 100%;
}

/* Coming Soon Chip */
.coming-soon-chip {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
}

/* Overlay for content */
.coming-soon-overlay {
    position: relative;
    opacity: 0.7;
    pointer-events: none;
}

.coming-soon-overlay::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(248, 249, 250, 0.8);
    backdrop-filter: blur(0.5px);
    border-radius: 0 0 12px 12px;
    z-index: 1;
}

.method-item {
    padding: 12px 0;
    border-bottom: 1px solid rgb(var(--v-theme-surface-variant), 0.3);
}

.method-item:last-child {
    border-bottom: none;
}


.method-icon-wrapper {
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
}

.method-info {
    flex: 1;
}

.method-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: rgb(var(--v-theme-on-surface));
    line-height: 1.2;
    margin-bottom: 2px;
}

.method-type {
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
    line-height: 1.2;
}

.usage-stats {
    text-align: right;
}

.usage-chip {
    font-weight: 600;
    font-size: 0.75rem;
}
</style>
