<template>
  <v-overlay v-if="$route.path.includes('manager')" v-model="loading" class="text-center">
    <v-progress-circular indeterminate color="#fca326" size="50" />
    <div class="white-text mt-3">
      {{ $t('common.loading') }}
    </div>
  </v-overlay>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const loading = computed(() => store.getters.loading)
</script>
