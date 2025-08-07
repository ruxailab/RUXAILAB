<template>
  <v-app>
    <GlobalToolbar />
    <GlobalErrorHandler />
    <v-main>
      <v-container fluid class="pa-0">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { GlobalToolbar } from '@/components/navigation'
import GlobalErrorHandler from '@/components/atoms/GlobalErrorHandler.vue'

export default {
  components: {
    GlobalToolbar,
    GlobalErrorHandler,
  },
}
</script>
