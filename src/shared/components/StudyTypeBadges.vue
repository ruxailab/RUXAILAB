<template>
  <div
    v-if="typeLabel || subtypeLabel"
    class="d-flex flex-wrap ga-2"
    role="group"
    :aria-label="$t('studyMetadata.groupLabel')"
  >
    <v-chip v-if="typeLabel" size="small" :color="color" variant="outlined">
      {{ typeLabel }}
    </v-chip>
    <v-chip v-if="subtypeLabel" size="small" :color="color" variant="outlined">
      {{ subtypeLabel }}
    </v-chip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  HEURISTIC_STUDY_SUBTYPES,
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
  normalizeStudyType,
} from '@/shared/constants/methodDefinitions'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
  color: {
    type: String,
    default: 'white',
  },
})

const { t } = useI18n()
const typeKeys = {
  [STUDY_TYPES.USER]: 'user',
  [STUDY_TYPES.HEURISTIC]: 'heuristic',
  [STUDY_TYPES.CARD_SORTING]: 'cardSorting',
  [STUDY_TYPES.ACCESSIBILITY_MANUAL]: 'manualAccessibility',
  [STUDY_TYPES.ACCESSIBILITY_AUTOMATIC]: 'automaticAccessibility',
  [STUDY_TYPES.FOCUS_GROUP]: 'focusGroup',
}
const subtypeKeys = {
  [USER_STUDY_SUBTYPES.UNMODERATED]: 'unmoderated',
  [USER_STUDY_SUBTYPES.MODERATED]: 'moderated',
  [HEURISTIC_STUDY_SUBTYPES.QUANTITATIVE]: 'quantitative',
  [HEURISTIC_STUDY_SUBTYPES.QUALITATIVE]: 'qualitative',
}

const normalizedType = computed(() => normalizeStudyType(props.test.testType))
const normalizedSubtype = computed(() =>
  String(props.test.subType || '').toUpperCase(),
)
const typeLabel = computed(() => {
  const typeKey = typeKeys[normalizedType.value]
  return typeKey ? t(`studyMetadata.types.${typeKey}`) : ''
})
const subtypeLabel = computed(() => {
  if (
    !normalizedSubtype.value ||
    normalizedSubtype.value === normalizedType.value
  ) {
    return ''
  }

  const subtypeKey = subtypeKeys[normalizedSubtype.value]
  return subtypeKey ? t(`studyMetadata.subtypes.${subtypeKey}`) : ''
})
</script>
