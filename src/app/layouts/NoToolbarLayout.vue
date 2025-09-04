<template>
  <v-app>
    <GlobalErrorHandler />
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
import GlobalErrorHandler from '@/app/layouts/components/GlobalErrorHandler.vue'

export default {
    components: {
        GlobalErrorHandler,
    },
}
</script>
