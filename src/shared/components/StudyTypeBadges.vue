<template>
  <div
    v-if="badges.length"
    class="d-flex flex-wrap"
    role="group"
    :aria-label="$t('studyMetadata.groupLabel')"
  >
    <v-chip
      v-for="badge in badges"
      :key="badge.label"
      :color="color || badge.color"
      size="small"
      class="ma-1"
    >
      <v-icon start size="14">{{ badge.icon }}</v-icon>
      {{ badge.label }}
    </v-chip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  getMethodDefinition,
  METHOD_CATEGORIES,
} from '@/shared/constants/methodDefinitions'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
  color: {
    type: String,
    default: '',
  },
})

const { t } = useI18n()
const badges = computed(() => {
  const definition = getMethodDefinition(
    props.test.testType,
    props.test.subType,
  )
  if (!definition) return []

  const category = METHOD_CATEGORIES[definition.category]
  const tags = [
    {
      label: t(`methods.definitions.${definition.id}`),
      color: definition.color,
      icon: definition.icon,
    },
  ]

  if (category) {
    tags.push({
      label: t(`methods.categories.${category.id}`),
      color: category.color,
      icon: category.icon,
    })
  }

  return tags
})
</script>
