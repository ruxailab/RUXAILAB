<template>
  <v-card class="h-100" variant="flat" border>
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
            {{
              t('focusGroup.session.plannedMinutes', {
                minutes: topic.durationMinutes,
              })
            }}
          </span>
        </template>
      </v-card-subtitle>

      <!-- Prompts are the facilitator's script, so mark the guide as private. -->
      <template v-if="isFacilitator" #append>
        <v-chip
          size="small"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-lock-outline"
        >
          {{ t('focusGroup.session.facilitatorGuideNote') }}
        </v-chip>
      </template>
    </v-card-item>

    <!-- Facilitator only: the discussion prompts to steer the topic. Participants
         and observers never see these — to them the topic is just its title. -->
    <v-card-text v-if="isFacilitator">
      <div v-if="prompts.length">
        <p class="text-overline mb-1 d-flex align-center ga-1">
          <v-icon size="16" color="primary">mdi-script-text-outline</v-icon>
          {{ t('focusGroup.session.yourPrompts') }}
        </p>
        <v-list density="compact" class="pa-0">
          <v-list-item v-for="(prompt, i) in prompts" :key="i" class="px-0">
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
  // Prompts are the facilitator's private script; only they see the guide body.
  isFacilitator: { type: Boolean, default: false },
})

const prompts = computed(() =>
  Array.isArray(props.topic?.prompts) ? props.topic.prompts : [],
)
</script>
