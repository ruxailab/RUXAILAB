<template>
  <div>
    <div
      v-if="topics.length === 0"
      class="text-center py-8 text-medium-emphasis"
    >
      <v-icon icon="mdi-forum-outline" size="48" class="mb-2" />
      <p class="text-body-2 mb-0">{{ $t('focusGroup.edit.noTopics') }}</p>
    </div>

    <v-card
      v-for="(topic, index) in topics"
      :key="topic.id"
      variant="outlined"
      rounded="lg"
      class="mb-4"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center ga-2 mb-3">
          <v-chip size="small" color="primary" variant="tonal">{{
            index + 1
          }}</v-chip>
          <v-text-field
            v-model="topic.title"
            :label="$t('focusGroup.edit.topicTitle')"
            variant="outlined"
            density="compact"
            hide-details
          />
          <v-btn
            icon="mdi-arrow-up"
            size="small"
            variant="text"
            :disabled="index === 0"
            :aria-label="$t('focusGroup.edit.moveUp')"
            @click="move(index, -1)"
          />
          <v-btn
            icon="mdi-arrow-down"
            size="small"
            variant="text"
            :disabled="index === topics.length - 1"
            :aria-label="$t('focusGroup.edit.moveDown')"
            @click="move(index, 1)"
          />
          <v-btn
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            color="error"
            :aria-label="$t('focusGroup.edit.removeTopic')"
            @click="removeTopic(index)"
          />
        </div>

        <!-- Prompts -->
        <div class="ml-8">
          <div
            v-for="(prompt, pIndex) in topic.prompts"
            :key="pIndex"
            class="d-flex align-center ga-2 mb-2"
          >
            <v-text-field
              v-model="topic.prompts[pIndex]"
              :label="$t('focusGroup.edit.prompt')"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              :aria-label="$t('focusGroup.edit.removePrompt')"
              @click="topic.prompts.splice(pIndex, 1)"
            />
          </div>

          <div class="d-flex align-center justify-space-between mt-2">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-plus"
              class="text-none"
              @click="topic.prompts.push('')"
            >
              {{ $t('focusGroup.edit.addPrompt') }}
            </v-btn>
            <v-text-field
              v-model.number="topic.durationMinutes"
              :label="$t('focusGroup.edit.duration')"
              type="number"
              min="1"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 140px"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-btn
      variant="tonal"
      color="primary"
      prepend-icon="mdi-plus"
      class="text-none"
      @click="addTopic"
    >
      {{ $t('focusGroup.edit.addTopic') }}
    </v-btn>
  </div>
</template>

<script setup>
import DiscussionTopic from '@/ux/FocusGroup/models/DiscussionTopic'

const topics = defineModel({ type: Array, default: () => [] })

const addTopic = () => {
  topics.value.push(new DiscussionTopic({}))
}

const removeTopic = (index) => {
  topics.value.splice(index, 1)
}

const move = (index, delta) => {
  const target = index + delta
  if (target < 0 || target >= topics.value.length) return
  const [item] = topics.value.splice(index, 1)
  topics.value.splice(target, 0, item)
}
</script>
