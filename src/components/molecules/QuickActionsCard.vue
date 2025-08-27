<template>
  <TestSettingsCard
    title="Quick Actions"
    subtitle="Perform common tasks instantly"
    icon="mdi-lightning-bolt"
    icon-color="amber-darken-2"
    icon-bg-class="bg-amber-lighten-5"
    card-class="actions-card"
  >
    <div class="d-flex flex-column ga-3">
      <v-btn color="orange-darken-1" variant="flat" class="text-none font-weight-semibold rounded-l py-3"
        height="48" :disabled="!hasData" block @click="$emit('duplicate')">
        <v-icon start size="18">mdi-content-duplicate</v-icon>
        Duplicate Test
      </v-btn>
      <v-btn color="success" variant="flat" class="text-none font-weight-semibold rounded-l py-3" height="48"
        :disabled="!hasData" block @click="$emit('export')">
        <v-icon start size="18">mdi-download</v-icon>
        Export Test
      </v-btn>
      <v-btn color="error" variant="flat" class="text-none font-weight-semibold rounded-l py-3" height="48"
        :disabled="!hasData" @click="$emit('delete')" block>
        <v-icon start size="18">mdi-delete-outline</v-icon>
        Delete Test
      </v-btn>
    </div>
  </TestSettingsCard>
</template>

<script setup>
import TestSettingsCard from './TestSettingsCard.vue'

defineProps({
  hasData: {
    type: Boolean,
    default: false
  }
})

defineEmits(['duplicate', 'export', 'delete'])
</script>
