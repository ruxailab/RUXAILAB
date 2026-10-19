<template>
  <v-card class="pa-10 text-center" variant="outlined">
    <v-progress-circular indeterminate color="primary" size="48" />
    <p class="text-body-1 mt-4 mb-0">
      {{ $t('analytics.queuePending.message') }}
    </p>
    <v-btn
      v-if="dashboardTo"
      class="mt-4"
      variant="text"
      color="primary"
      :to="dashboardTo"
    >
      {{ $t('analytics.queuePending.openDashboard') }}
    </v-btn>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { USER_STUDY_SUBTYPES } from '@/shared/constants/methodDefinitions'

const store = useStore()

const dashboardTo = computed(() => {
  const test = store.getters.test
  if (!test?.id) return null
  const kind =
    test.subType === USER_STUDY_SUBTYPES.MODERATED ? 'moderated' : 'unmoderated'
  return `/userTest/${kind}/dashboard/${test.id}`
})
</script>
