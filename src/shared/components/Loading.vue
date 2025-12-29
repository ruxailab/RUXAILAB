<template>
  <v-overlay
    v-if="$route.path.includes('manager')"
    v-model="loading"
    class="d-flex flex-column justify-center align-center text-center"
  >
    <template v-if="type === 'logo'">
      <v-img
        :src="logo"
        class="spin-loader"
        width="60"
        height="60"
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
      {{ $t('common.loading') }}
    </div>
  </v-overlay>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import logo from '@/assets/logo_small_blue.png' 

const props = defineProps({
  type: {
    type: String,
    default: 'default',
  }
})

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