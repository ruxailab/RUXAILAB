<template>
  <v-overlay
    :model-value="modelValue"
    class="d-flex flex-column justify-center align-center text-center loader-overlay"
  >
    <div class="loader-content">
      <template v-if="type === 'logo'">
        <v-img
          :src="logo"
          class="spin-loader"
          width="120"
          height="120"
          contain
        />
      </template>
      <template v-else>
        <v-progress-circular
          indeterminate
          color="#fca326"
          size="50"
        />
      </template>

      <div class="white-text mt-3">
        {{ text || $t('common.loading') }}
      </div>
    </div>
  </v-overlay>
</template>

<script setup>
import logo from '@/assets/logo_small_red.png' 

const props = defineProps({
  type: {
    type: String,
    default: 'logo',
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.loader-overlay {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.white-text {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.spin-loader {
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0% { 
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% { 
    transform: scale(1.1);
    opacity: 1;
  }
  100% { 
    transform: scale(0.9);
    opacity: 0.7;
  }
}
</style>