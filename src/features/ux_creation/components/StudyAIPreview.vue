<template>
  <div class="study-ai-preview">
    <div v-if="!draft || draft.clarificationNeeded" class="study-ai-preview__empty">
      <v-icon icon="mdi-robot-outline" size="40" color="grey" class="mb-2" />
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ $t('studyCreation.ai.previewEmpty') }}
      </p>
    </div>

    <template v-else>
      <div class="study-ai-preview__header">
        <v-chip size="small" color="primary" variant="tonal">
          {{ draft.testType }}
        </v-chip>
        <v-chip
          v-if="draft.subType"
          size="small"
          color="secondary"
          variant="tonal"
          class="ml-2"
        >
          {{ draft.subType }}
        </v-chip>
      </div>

      <v-text-field
        :model-value="draft.testTitle"
        :label="$t('studyCreation.details.studyTitle')"
        variant="outlined"
        density="comfortable"
        class="mb-2"
        @update:model-value="patchField('testTitle', $event)"
      />
      <v-textarea
        :model-value="draft.testDescription"
        :label="$t('studyCreation.details.studyDescription')"
        variant="outlined"
        density="comfortable"
        rows="2"
        class="mb-4"
        @update:model-value="patchField('testDescription', $event)"
      />

      <!-- Card Sorting -->
      <template v-if="draft.testType === 'CARD_SORTING'">
        <h4 class="text-subtitle-2 mb-2">{{ $t('studyCreation.ai.cards') }}</h4>
        <v-list density="compact" class="mb-3 bg-transparent">
          <v-list-item
            v-for="(card, index) in cardSorting.cards"
            :key="`card-${index}`"
          >
            <v-list-item-title>{{ card.title }}</v-list-item-title>
            <v-list-item-subtitle v-if="card.description">
              {{ card.description }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <h4 class="text-subtitle-2 mb-2">{{ $t('studyCreation.ai.categories') }}</h4>
        <v-list density="compact" class="mb-3 bg-transparent">
          <v-list-item
            v-for="(category, index) in cardSorting.categories"
            :key="`cat-${index}`"
          >
            <v-list-item-title>{{ category.title }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="!cardSorting.categories?.length">
            <v-list-item-title class="text-medium-emphasis">
              {{ $t('studyCreation.ai.noCategories') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <p class="text-body-2 mb-0">
          <strong>{{ $t('studyCreation.ai.mode') }}:</strong>
          {{ cardSortingMode }}
        </p>
      </template>

      <!-- User Test -->
      <template v-else-if="draft.testType === 'USER'">
        <h4 class="text-subtitle-2 mb-2">{{ $t('studyCreation.ai.tasks') }}</h4>
        <v-list density="compact" class="bg-transparent">
          <v-list-item
            v-for="(task, index) in userTasks"
            :key="`task-${index}`"
          >
            <v-list-item-title>{{ task.taskName }}</v-list-item-title>
            <v-list-item-subtitle>{{ task.taskDescription }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>

      <!-- Heuristic -->
      <template v-else-if="draft.testType === 'HEURISTIC'">
        <h4 class="text-subtitle-2 mb-2">{{ $t('studyCreation.ai.heuristics') }}</h4>
        <v-list density="compact" class="bg-transparent">
          <v-list-item
            v-for="(heuristic, index) in heuristics"
            :key="`h-${index}`"
          >
            <v-list-item-title>{{ heuristic.title }}</v-list-item-title>
            <v-list-item-subtitle>
              {{
                $t('studyCreation.ai.questionsCount', {
                  count: heuristic.questions?.length || 0,
                })
              }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>

      <!-- Focus Group -->
      <template v-else-if="draft.testType === 'FOCUS_GROUP'">
        <h4 class="text-subtitle-2 mb-2">
          {{ $t('studyCreation.ai.discussionGuide') }}
        </h4>
        <v-list density="compact" class="bg-transparent">
          <v-list-item
            v-for="(topic, index) in draft.discussionGuide || []"
            :key="`topic-${index}`"
          >
            <v-list-item-title>{{ topic.title }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ (topic.prompts || []).join(' · ') }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { inferCardSortingMode } from '@/ai/study-generation/validators/cardSorting'

const props = defineProps({
  draft: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:draft'])
const { t } = useI18n()

const cardSorting = computed(
  () => props.draft?.testStructure?.cardSorting || { cards: [], categories: [], options: {} },
)

const userTasks = computed(
  () => props.draft?.testStructure?.userTasks || [],
)

const heuristics = computed(() =>
  Array.isArray(props.draft?.testStructure) ? props.draft.testStructure : [],
)

const cardSortingMode = computed(() => {
  const mode = inferCardSortingMode(
    cardSorting.value.options,
    cardSorting.value.categories,
  )
  return t(`studyCreation.ai.modes.${mode}`)
})

const patchField = (field, value) => {
  if (!props.draft) return
  emit('update:draft', { ...props.draft, [field]: value })
}
</script>

<style scoped>
.study-ai-preview {
  height: 100%;
  min-height: 420px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.study-ai-preview__empty {
  height: 100%;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.study-ai-preview__header {
  margin-bottom: 16px;
}
</style>
