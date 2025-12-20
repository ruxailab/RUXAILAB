<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    persistent
  >
    <template #activator="{ props }">
      <v-btn
        color="success"
        variant="outlined"
        size="small"
        block
        prepend-icon="mdi-lightbulb-outline"
        v-bind="props"
      >
        Tip
      </v-btn>
    </template>

    <v-card class="tip-modal">
      <v-card-title class="tip-header d-flex align-center pa-4">
        <div class="tip-icon-container mr-3">
          <v-icon 
            size="32" 
            color="white"
          >
            mdi-lightbulb
          </v-icon>
        </div>
        <div>
          <h2 class="text-h5 font-weight-bold text-white mb-1">
            Helpful Tip
          </h2>
          <p class="text-subtitle-2 text-white opacity-90 mb-0">
            {{ task.taskName }}
          </p>
        </div>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          size="small"
          @click="dialog = false"
        >
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="tip-content">
          <div 
            class="rich-text text-body-1 text-grey-darken-3 line-height-relaxed"
            v-html="task.taskTip"
          />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="success"
          variant="flat"
          size="large"
          prepend-icon="mdi-check"
          @click="dialog = false"
        >
          Got it!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    default: () => ({
      taskName: '',
      taskTip: '',
    }),
  },
})

const dialog = ref(false)
</script>

<style scoped>
.tip-modal {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
}

.tip-header {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border-radius: 16px 16px 0 0;
}

.tip-icon-container {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.tip-content {
  max-height: 400px;
  overflow-y: auto;
}

.line-height-relaxed {
  line-height: 1.6;
}

.rich-text :deep(p) {
  margin-bottom: 12px;
}

.rich-text :deep(p:last-child) {
  margin-bottom: 0;
}

.rich-text :deep(strong) {
  font-weight: 600;
  color: #2E7D32;
}

.rich-text :deep(em) {
  font-style: italic;
  color: #424242;
}

.rich-text :deep(ul) {
  margin: 12px 0;
  padding-left: 20px;
}

.rich-text :deep(li) {
  margin-bottom: 6px;
}

/* Hover effects */
.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Modal animation */
.tip-modal {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
