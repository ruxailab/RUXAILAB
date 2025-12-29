<template>
  <v-card
    elevation="2"
    rounded="lg"
    class="top-methods-card position-relative"
  >
    <v-card-title class="d-flex align-center py-4">
      <div class="d-flex align-center justify-space-between w-100">
        <span class="text-h6 font-weight-bold">Most used methods</span>
      </div>
    </v-card-title>

    <v-card-text class="pa-4">
      <div v-if="topMethods.length > 0" class="methods-list">
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
              </div>
            </div>
            <div class=" usage-stats">
              <v-chip
                :color="method.color"
                variant="tonal"
                size="small"
                class="usage-chip"
              >
                {{ method.usage }} {{ method.usage == 1 ? 'Use' : 'Uses' }}
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
import { computed } from 'vue'

const props = defineProps({
    methodsData: {
        type: Array,
        default: () => []
    }
})

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

.methods-list {
  flex: 1;
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
