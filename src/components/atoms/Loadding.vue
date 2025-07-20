<template>
  <v-overlay v-if="true" v-model="loading" class="text-center">
    <v-progress-circular indeterminate color="#fca326" size="50" />
    <div class="white-text mt-3">
      Loading
    </div>
  </v-overlay>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const loading = computed(() => store.getters.loading)
</script>
