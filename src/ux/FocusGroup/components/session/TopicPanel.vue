<template>
  <v-card class="topic-guide" variant="flat" rounded="lg">
    <!-- Header -->
    <div class="topic-guide__header">
      <div class="topic-guide__num">{{ index + 1 }}</div>
      <div class="topic-guide__head-text">
        <h3 class="topic-guide__title">
          {{ topic?.title || t('focusGroup.session.untitledTopic') }}
        </h3>
        <div class="topic-guide__meta">
          <v-icon size="13">mdi-format-list-numbered</v-icon>
          <span>
            {{
              t('focusGroup.session.topicProgress', {
                current: index + 1,
                total,
              })
            }}
          </span>
          <template v-if="topic?.durationMinutes">
            <span class="topic-guide__dot">•</span>
            <v-icon size="13">mdi-clock-outline</v-icon>
            <span>
              {{
                t('focusGroup.session.plannedMinutes', {
                  minutes: topic.durationMinutes,
                })
              }}
            </span>
          </template>
        </div>
        <!-- Prompts are the facilitator's script, so mark the guide as private. -->
        <div v-if="isFacilitator" class="topic-guide__private">
          <v-icon size="13">mdi-lock-outline</v-icon>
          {{ t('focusGroup.session.facilitatorGuideNote') }}
        </div>
      </div>
    </div>

    <!-- Facilitator only: the discussion prompts to steer the topic. Participants
         and observers never see these — to them the topic is just its title. -->
    <div v-if="isFacilitator" class="topic-guide__body">
      <div v-if="prompts.length">
        <div class="topic-guide__section">
          <v-icon size="15" color="primary">mdi-script-text-outline</v-icon>
          {{ t('focusGroup.session.yourPrompts') }}
        </div>
        <div class="prompt-list">
          <div
            v-for="(prompt, i) in prompts"
            :key="i"
            class="prompt-row"
            :class="{ 'prompt-row--active': prompt === currentPromptText }"
          >
            <v-icon size="18" class="prompt-row__icon">
              mdi-comment-question-outline
            </v-icon>
            <span class="prompt-row__text">{{ prompt }}</span>

            <!-- Surface a prompt to participants as the current question, or
                 show which one is already live. -->
            <v-chip
              v-if="prompt === currentPromptText"
              size="small"
              color="success"
              variant="flat"
              prepend-icon="mdi-check"
            >
              {{ t('focusGroup.session.asked') }}
            </v-chip>
            <v-btn
              v-else
              class="prompt-row__ask"
              size="small"
              color="accent"
              variant="flat"
              prepend-icon="mdi-send"
              @click="emit('ask', prompt)"
            >
              {{ t('focusGroup.session.ask') }}
            </v-btn>
          </div>
        </div>
      </div>
      <p v-else class="topic-guide__empty">
        {{ t('focusGroup.session.noPrompts') }}
      </p>
    </div>
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
  // Text of the prompt currently surfaced as the active question, to flag it.
  currentPromptText: { type: String, default: '' },
})

const emit = defineEmits(['ask'])

const prompts = computed(() =>
  Array.isArray(props.topic?.prompts) ? props.topic.prompts : [],
)
</script>

<style scoped>
.topic-guide {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}

/* --- Header: brand-tinted band with a filled navy number badge --- */
.topic-guide__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.06),
    rgba(var(--v-theme-primary), 0.01)
  );
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}

.topic-guide__num {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgb(var(--v-theme-primary));
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.28);
}

.topic-guide__head-text {
  flex: 1 1 auto;
  min-width: 0;
}

.topic-guide__title {
  margin: 0 0 4px;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  color: rgb(var(--v-theme-primary));
}

.topic-guide__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.topic-guide__dot {
  opacity: 0.5;
}

.topic-guide__private {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

/* --- Body: prompt rows --- */
.topic-guide__body {
  padding: 16px 18px 18px;
}

.topic-guide__section {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid transparent;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.prompt-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
}

.prompt-row--active {
  background: rgba(var(--v-theme-success), 0.08);
  border-color: rgba(var(--v-theme-success), 0.3);
}

.prompt-row__icon {
  flex: 0 0 auto;
  color: rgb(var(--v-theme-accent));
}

.prompt-row__text {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.9rem;
  line-height: 1.35;
}

.prompt-row__ask {
  flex: 0 0 auto;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.topic-guide__empty {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}
</style>
