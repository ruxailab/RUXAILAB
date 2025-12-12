<template>
  <v-overlay
    :model-value="true"
    class="rux-loader-overlay"
    persistent
  >
    <div class="rux-loader-wrapper">
      <img
        :src="logoX"
        alt="Loading"
        class="rux-loader-icon"
      />
      <div class="loader-text mt-3" v-if="text">
        {{ text }}
      </div>
    </div>
  </v-overlay>
</template>

<script setup>
import logoX from '@/assets/logo_full_white.png';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.rux-loader-overlay {
  z-index: 9999;
}

.rux-loader-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.rux-loader-icon {
  width: 80px;
  height: 80px;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.loader-text {
  font-size: 16px;
  color: white;
}
</style>