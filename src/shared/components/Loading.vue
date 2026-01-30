<template>
  <Transition name="fade">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-container">
        <img :src="redXLogo" alt="Loading" class="spinning-logo" />
        <div class="loading-text">
          {{ loadingMessage }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import redXLogo from '@/assets/logo_small_red.png'

const store = useStore()

const loading = computed(() => store.getters.loading)
const loadingMessage = computed(
  () => store.state.loadingMessage || 'Loading...',
)
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
  gap: 16px;
}

.spinning-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  animation: spin 2s linear infinite;
}

.loading-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
