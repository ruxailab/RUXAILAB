<template>
  <div class="x-loader-container">
    <v-img
      :src="logo"
      class="x-loader-logo"
      width="80"
      height="80"
      contain
    />
  </div>
</template>

<script setup>
import logo from '@/assets/logo_small_blue.png'
</script>

<style scoped>
.x-loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.x-loader-logo {
  animation: pulse-spin 2s infinite ease-in-out;
}

@keyframes pulse-spin {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}
</style>
