<template>
  <v-app>
    <GlobalToastHandler />
    <UploadProgressDialog />
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
import UploadProgressDialog from '@/shared/components/UploadProgressDialog.vue'

export default {
    components: {
        GlobalToastHandler,
        UploadProgressDialog,
    },
}
</script>
