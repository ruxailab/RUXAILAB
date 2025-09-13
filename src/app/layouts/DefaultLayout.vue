<template>
  <v-app>
    <GlobalToolbar />
    <GlobalErrorHandler />

    <GlobalToastHandler />
    <v-main>
      <v-container
        fluid
        class="pa-0"
      >
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { GlobalToolbar } from '@/features/navigation/utils'
import GlobalErrorHandler from '@/app/layouts/components/GlobalErrorHandler.vue'
import GlobalToastHandler from '@/app/layouts/components/GlobalToastHandler.vue'

export default {
  components: {
    GlobalToolbar,
    GlobalErrorHandler,
    GlobalToastHandler,
  },
}
</script>
