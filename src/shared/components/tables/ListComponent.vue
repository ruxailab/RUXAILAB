<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :sort-by="sortBy || [{ key: 'updateDate', order: 'desc' }]"
    item-key="id"
    density="comfortable"
    class="rounded-lg"
    elevation="2"
    hover
    :loading="loadingStudy"
    :items-per-page-text="t('common.table.itemsPerPage')"
    @click:row="emitClick"
  >
    <!-- Type Column -->
    <template #item.type="{ item }">
      <v-tooltip location="top">
        <template #activator="{ props }">
          <v-avatar
            v-bind="props"
            size="32"
            :color="getAvatarColor(item)"
            variant="tonal"
          >
            <v-icon size="18">
              {{ getTypeIcon(item) }}
            </v-icon>
          </v-avatar>
        </template>
        <span>
          {{ getTestType(item) }}
        </span>
      </v-tooltip>
    </template>

    <!-- Name Column -->
    <template #item.name="{ item }">
      <div class="d-flex flex-column" style="line-height: 1">
        <div class="text-subtitle-1 font-weight-medium text-on-surface">
          {{ getItemTitle(item) }}
        </div>
        <!-- <div v-if="type == 'sessions'" class="text-caption text-medium-emphasis">
          Session Date: {{formatDateTime(item.testDate, 'es')}}
        </div>
        <div v-else class="text-caption text-medium-emphasis">
          <span v-if="item.testAuthorEmail">
            Last Updated:
          </span>
          <span v-else>
            Creation Date:
          </span>
           {{ formatItemDate(item) }}
        </div> -->
      </div>
    </template>

    <template #item.tags="{ item }">
      <v-chip
        v-for="(tag, i) in getTags(item)"
        :key="i"
        :color="tag.color"
        size="small"
        class="ma-1"
      >
        <v-icon start size="14">{{ tag.icon }}</v-icon>
        {{ tag.label }}
      </v-chip>
    </template>

    <template #item.updateDate="{ item }">
      {{ formatItemDate(item) }}
    </template>

    <template #item.creationDate="{ item }">
      {{ formatItemDate(item) }}
    </template>

    <template #item.testDate="{ item }">
      {{ formatDateTime(item.testDate, 'es') }}
    </template>

    <!-- Owner Column -->
    <template #item.owner="{ item }">
      {{ getOwnerName(item) }}
    </template>

    <template #item.evaluator="{ item }">
      {{ item.email }}
    </template>

    <!-- Participants Column -->
    <template #item.participants="{ item }">
      <v-chip
        size="small"
        variant="tonal"
        :color="getParticipantCount(item) > 0 ? 'info' : 'light'"
        prepend-icon="mdi-account-multiple"
      >
        {{ getParticipantCount(item) }}
      </v-chip>
    </template>

    <!-- Status Column -->
    <template #item.status="{ item }">
      <v-chip
        label
        variant="tonal"
        :color="getSessionStatus(item.testDate).variant"
      >
        {{ getSessionStatus(item.testDate).label }}
      </v-chip>
    </template>

    <!-- No Data Slot -->
    <template #no-data>
      <div v-if="isFiltered" class="pa-8 text-center text-medium-emphasis">
        <v-icon size="48" color="grey-lighten-1" class="mb-2">
          mdi-magnify-remove-outline
        </v-icon>
        <div class="text-h6 mt-2">{{ t('common.table.noSearchResults') }}</div>
        <div class="text-body-2">
          {{ t('common.table.tryAdjustingSearch') }}
        </div>
      </div>
      <div v-else class="text-center pa-4">
        <span>
          {{ getEmptyStateMessage(t) }}
        </span>
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useItemFormatting } from '@/shared/composables/useItemFormatting'
import { useItemTypes } from '@/shared/composables/useItemTypes'
import { useDataTableConfig } from '@/shared/composables/useDataTableConfig'
import { formatDateTime } from '@/shared/utils/dateUtils'
import { getSessionStatus } from '@/shared/utils/sessionsUtils'
import store from '@/store'

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
  sortBy: {
    type: Array,
    required: false,
    default: null,
  },
  isFiltered: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['clicked'])

const { t } = useI18n()

// Composables
const typeRef = toRef(props, 'type')
const { headers, getEmptyStateMessage } = useDataTableConfig(typeRef, t)
const {
  getItemTitle,
  getOwnerName,
  getTags,
  getParticipantCount,
  formatItemDate,
} = useItemFormatting(typeRef)
const { getTypeIcon, getTestType, getAvatarColor } = useItemTypes()

const loadingStudy = computed(() => {
  return store.getters.loading
})

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
  color: #1f2937 !important;
}

/* Optional: Add a subtle border between rows for better separation */
:deep(.v-data-table__tr:not(:last-child)) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
