<template>
  <v-app>
    <GlobalToolbar />
    <GlobalErrorHandler />

    <GlobalToastHandler />
    <Loading />
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
import Loading from '@/shared/components/Loading.vue'

export default {
  components: {
    GlobalToolbar,
    GlobalErrorHandler,
    GlobalToastHandler,
    Loading,
  },
}
</script>
