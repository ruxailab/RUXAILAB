<template>
  <v-app>
    <GlobalToolbar />
    <GlobalToastHandler />
    <Loading />
    <PendingInviteDialog />
    <v-main>
      <v-container fluid class="pa-0">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { GlobalToolbar } from '@/features/navigation/utils'
import GlobalToastHandler from '@/app/layouts/components/GlobalToastHandler.vue'
import Loading from '@/shared/components/Loading.vue'
import PendingInviteDialog from '@/shared/components/dialogs/PendingInviteDialog.vue'

export default {
  components: {
    GlobalToolbar,
    GlobalToastHandler,
    Loading,
    PendingInviteDialog,
  },
}
</script>
