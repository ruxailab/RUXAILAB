<template>
  <v-data-table :headers="headers" :items="items" :sort-by="[{ key: 'updateDate', order: 'desc' }]" item-key="id"
    density="comfortable" class="rounded-lg" elevation="2" @click:row="emitClick" hover>
    <!-- Type Column -->
    <template #item.type="{ item }">
      <v-tooltip location="top">
        <template #activator="{ props }">
          <v-avatar v-bind="props" size="32" :color="getAvatarColor(item)" style="color: #fff">
            <v-icon size="18">
              {{ getTypeIcon(item) }}
            </v-icon>
          </v-avatar>
        </template>
        <span>
          {{ item.header?.templateType ?? getTestType(item) }}
        </span>
      </v-tooltip>
    </template>

    <!-- Name Column -->
    <template #item.name="{ item }">
      <div class="d-flex flex-column" style="line-height: 1;">
        <div class="text-subtitle-1 font-weight-medium text-on-surface">
          {{ getItemTitle(item) }}
        </div>
        <div class="text-caption text-medium-emphasis">
          Fecha creación: {{ formatItemDate(item) }}
        </div>
      </div>
    </template>

    <!-- Owner Column -->
    <template #item.owner="{ item }">
      <div class="d-flex align-center">
        <v-avatar size="32" class="mr-3">
          <v-img v-if="getOwnerImage(item)" :src="getOwnerImage(item)" cover />
          <span v-else class="font-weight-medium">
            {{ getOwnerName(item)?.[0]?.toUpperCase() ?? '?' }}
          </span>
        </v-avatar>
        <span class="text-body-1">
          {{ getOwnerName(item) }}
        </span>
      </div>
    </template>

    <!-- Participants Column -->
    <template #item.participants="{ item }">
      <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-account-multiple">
        {{ item.numberColaborators ?? 0 }}
      </v-chip>
    </template>

    <!-- No Data Slot -->
    <template #no-data>
      <div class="text-center pa-4">
        <span>
          {{ getEmptyStateMessage(t) }}
        </span>
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useItemFormatting } from '@/composables/useItemFormatting'
import { useItemTypes } from '@/composables/useItemTypes'
import { useDataTableConfig } from '@/composables/useDataTableConfig'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
  type: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['clicked'])

const { t } = useI18n()

// Composables
const typeRef = toRef(props, 'type')
const { headers, getEmptyStateMessage } = useDataTableConfig(typeRef)
const { getItemTitle, getOwnerName, getOwnerImage, getParticipantCount, formatItemDate } = useItemFormatting(typeRef)
const { getTypeIcon, getTestType, getAvatarColor } = useItemTypes()

// Event handlers
const emitClick = (event, { item }) => {
  emit('clicked', item)
}
</script>

<style scoped>
/* Custom hover effect for rows */
:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

/* Ensure proper cursor for clickable rows */
:deep(.v-data-table__tr) {
  cursor: pointer;
}

/* Add margin between rows */
:deep(.v-data-table__tr td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

/* Header styling */
:deep(.v-data-table-header__content) {
  font-weight: 700 !important;
  color: #1F2937 !important;
}

/* Optional: Add a subtle border between rows for better separation */
:deep(.v-data-table__tr:not(:last-child)) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
