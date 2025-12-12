<template>
  <div class="d-none d-md-flex">
    <v-btn
      v-if="!isHelp"
      size="small"
      icon
      class="mr-1"
      @click="$router.push('/help')"
    >
      <v-icon size="20">
        mdi-help-circle-outline
      </v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const isHelp = computed(() => route.name === 'Help') // Use strict equality

</script>

<style></style>
