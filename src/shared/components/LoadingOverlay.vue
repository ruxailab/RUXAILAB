<template>
  <Transition name="fade">
    <div v-if="isVisible" class="loading-overlay">
      <div class="loading-container">
        <img 
          :src="redXLogo" 
          alt="Loading"
          class="spinning-logo"
        />
        <div class="loading-text">
          {{ loadingMessage }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import redXLogo from '@/assets/logo_small_red.png'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
})

const loadingMessage = computed(() => {
  return props.message || 'Loading...'
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.spinning-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  animation: spin 2s linear infinite;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  text-align: center;
  letter-spacing: 0.5px;
  min-height: 24px;
}

/* Spinning animation for the logo */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Fade transition for smooth appearance/disappearance */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Responsive design */
@media (max-width: 768px) {
  .spinning-logo {
    width: 50px;
    height: 50px;
  }

  .loading-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .loading-container {
    gap: 16px;
  }

  .spinning-logo {
    width: 40px;
    height: 40px;
  }

  .loading-text {
    font-size: 13px;
  }
}
</style>
