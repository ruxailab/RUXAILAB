<template>
  <div v-if="titles.length || duplicates">
    <p class="text-body-2 text-grey-darken-2 mt-3 mb-0">
      {{ countLabel }}
      <span v-if="duplicates" class="text-medium-emphasis">
        {{
          $t('CardSorting.importDuplicatesSkipped', {
            count: duplicates,
          })
        }}
      </span>
    </p>

    <div v-if="titles.length" class="import-preview mt-3 rounded-lg pa-3">
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="title in visibleTitles"
          :key="title"
          size="small"
          variant="tonal"
          :color="chipColor"
        >
          {{ title }}
        </v-chip>
        <v-chip v-if="hiddenCount > 0" size="small" variant="outlined">
          {{ $t('CardSorting.importMoreItems', { count: hiddenCount }) }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const PREVIEW_LIMIT = 12

const props = defineProps({
  titles: {
    type: Array,
    default: () => [],
  },
  duplicates: {
    type: Number,
    default: 0,
  },
  isCategory: Boolean,
})

const { t } = useI18n()

const chipColor = computed(() =>
  props.isCategory ? 'primary' : 'orange-darken-1',
)

const visibleTitles = computed(() => props.titles.slice(0, PREVIEW_LIMIT))

const hiddenCount = computed(() =>
  Math.max(0, props.titles.length - PREVIEW_LIMIT),
)

const countLabel = computed(() => {
  const count = props.titles.length
  return props.isCategory
    ? t('CardSorting.importCountCategories', { count })
    : t('CardSorting.importCountCards', { count })
})
</script>

<style scoped>
.import-preview {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  max-height: 160px;
  overflow-y: auto;
}
</style>
