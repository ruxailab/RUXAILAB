<template>
  <v-card
    class="stats-card"
    elevation="2"
    rounded="lg"
    :class="`border-${color}`"
  >
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div
          class="stats-icon"
          :class="`bg-${color}`"
        >
          <v-icon
            :icon="icon"
            size="24"
            color="white"
          />
        </div>
        <div
          v-if="trend"
          class="trend-indicator"
          :class="trendClass"
        >
          <v-icon
            :icon="trendIcon"
            size="16"
          />
          <span class="text-caption ml-1">{{ trend.value }}%</span>
        </div>
      </div>

      <div class="stats-content">
        <h3 class="text-h4 font-weight-bold text-grey-darken-4 mb-1">
          {{ formattedValue }}
        </h3>
        <p class="text-body-2 text-grey-darken-1 mb-0">
          {{ title }}
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    value: {
        type: [Number, String],
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: 'primary'
    },
    trend: {
        type: Object,
        default: null
    }
})

const formattedValue = computed(() => {
    if (typeof props.value === 'number') {
        return props.value.toLocaleString()
    }
    return props.value
})

const trendClass = computed(() => {
    if (!props.trend) return ''
    return props.trend.direction === 'up' ? 'trend-up' : 'trend-down'
})

const trendIcon = computed(() => {
    if (!props.trend) return ''
    return props.trend.direction === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'
})
</script>

<style scoped>
.stats-card {
    height: 100%;
    transition: transform 0.2s ease-in-out;
}

.stats-card:hover {
    transform: translateY(-2px);
}

.stats-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.trend-indicator {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 16px;
    font-weight: 500;
}

.trend-up {
    background-color: #e8f5e8;
    color: #2e7d32;
}

.trend-down {
    background-color: #fff3e0;
    color: #f57c00;
}

.border-primary {
    border-left: 4px solid rgb(var(--v-theme-primary));
}

.border-success {
    border-left: 4px solid rgb(var(--v-theme-success));
}

.border-warning {
    border-left: 4px solid rgb(var(--v-theme-warning));
}

.border-info {
    border-left: 4px solid rgb(var(--v-theme-info));
}

.bg-primary {
    background-color: rgb(var(--v-theme-primary));
}

.bg-success {
    background-color: rgb(var(--v-theme-success));
}

.bg-warning {
    background-color: rgb(var(--v-theme-warning));
}

.bg-info {
    background-color: rgb(var(--v-theme-info));
}
</style>
