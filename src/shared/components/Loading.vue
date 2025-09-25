<template>
  <v-overlay
    v-if="$route.path.includes('manager')"
    v-model="loading"
    class="d-flex flex-column align-center justify-center text-center"
  >
    <v-progress-circular
      indeterminate
      color="#fca326"
      size="50"
    />
    <div class="white-text mt-3">
      {{ $t('common.loading') }}
    </div>
  </v-overlay>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import logo from '@/assets/ruxailab_logotip_Mesa_de_trabajo_1_copia_11.png' 

const store = useStore()
const loading = computed(() => store.getters.loading)
</script>

<style scoped>
.spin-loader {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
