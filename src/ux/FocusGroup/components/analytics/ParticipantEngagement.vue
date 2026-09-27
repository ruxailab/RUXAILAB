<template>
  <div v-if="entries.length" class="participant-engagement">
    <div
      v-for="entry in entries"
      :key="entry.userId"
      class="participant-engagement__row"
    >
      <span class="participant-engagement__name text-truncate">{{ entry.name }}</span>
      <v-progress-linear
        :model-value="entry.percent"
        color="primary"
        height="8"
        rounded
        class="participant-engagement__bar"
      />
      <span class="participant-engagement__percent">{{ entry.percent }}%</span>
    </div>
  </div>
  <p v-else class="text-medium-emphasis mb-0">
    {{ $t('focusGroup.analytics.noEngagementYet') }}
  </p>
</template>

<script setup>
// [{ userId, name, percent }], already computed by computeParticipation()
// against the persisted session — this component only renders it.
defineProps({
  entries: { type: Array, default: () => [] },
})
</script>

<style scoped>
.participant-engagement__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.participant-engagement__name {
  flex: 0 0 140px;
  font-size: 0.85rem;
}

.participant-engagement__bar {
  flex: 1 1 auto;
}

.participant-engagement__percent {
  flex: 0 0 40px;
  text-align: right;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
