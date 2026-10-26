<template>
  <v-app>
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
import GlobalToastHandler from '@/app/layouts/components/GlobalToastHandler.vue'

export default {
    components: {
        GlobalToastHandler,
    },
}
</script>
