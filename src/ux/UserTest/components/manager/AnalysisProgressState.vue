<template>
  <v-row justify="center" align="center" class="my-12">
    <v-col cols="auto" class="text-center">
      <v-progress-circular indeterminate size="64" color="primary" />
      <div class="mt-3 text-body-1 font-weight-medium">
        {{ title }}
      </div>
      <div v-if="showQueueMessage" class="mt-1 text-body-2 text-grey-darken-1">
        {{ $t('analytics.queuePending.message') }}
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  showQueueMessage: { type: Boolean, default: false },
})
</script>
