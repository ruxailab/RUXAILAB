<template>
  <v-card class="h-100">
    <v-card-item>
      <template #prepend>
        <v-avatar color="primary" variant="tonal" size="40">
          {{ index + 1 }}
        </v-avatar>
      </template>
      <v-card-title class="text-wrap">
        {{ topic?.title || t('focusGroup.session.untitledTopic') }}
      </v-card-title>
      <v-card-subtitle class="d-flex align-center flex-wrap ga-1">
        <span>
          {{
            t('focusGroup.session.topicProgress', {
              current: index + 1,
              total,
            })
          }}
        </span>
        <template v-if="topic?.durationMinutes">
          <v-icon size="4">mdi-circle</v-icon>
          <span>
            {{ t('focusGroup.session.plannedMinutes', { minutes: topic.durationMinutes }) }}
          </span>
        </template>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <div v-if="prompts.length">
        <p class="text-overline mb-1">{{ t('focusGroup.session.prompts') }}</p>
        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="(prompt, i) in prompts"
            :key="i"
            class="px-0"
          >
            <template #prepend>
              <v-icon size="18" color="primary" class="me-2">
                mdi-comment-question-outline
              </v-icon>
            </template>
            <v-list-item-title class="text-body-2 text-wrap">
              {{ prompt }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
      <p v-else class="text-body-2 text-medium-emphasis mb-0">
        {{ t('focusGroup.session.noPrompts') }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  topic: { type: Object, default: null },
  index: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

const prompts = computed(() =>
  Array.isArray(props.topic?.prompts) ? props.topic.prompts : [],
)
</script>
