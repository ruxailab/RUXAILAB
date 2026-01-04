<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-title :class="['text-h6', color]">
      <v-icon class="mr-2">{{ icon }}</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-text>
      <v-card
        v-for="(question, i) in questions"
        :key="i"
        variant="outlined"
        :class="{ 'my-3': true, 'border-error': !answers[i] }"
      >
        <v-card-text>
          <span :class="{ 'text-error': !answers[i] }"
            >{{ startIndex + i }}. {{ question }} *</span
          >
          <v-divider class="my-3" />

          <v-radio-group
            :model-value="answers[i]"
            @update:model-value="updateAnswer(i, $event)"
            inline
            class="justify-center"
          >
            <v-radio
              v-for="(scale, n) in tamScale"
              :key="n"
              :value="scale.value"
              class="d-flex flex-column align-center mx-2"
            >
              <template #label>
                <div class="text-center mt-1 text-caption">
                  {{ scale.label }}
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { TAM_SCALE } from '../utils/tamData.js'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  questions: {
    type: Array,
    required: true,
  },
  answers: {
    type: Array,
    required: true,
  },
  startIndex: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:answers'])

const tamScale = TAM_SCALE

const updateAnswer = (index, value) => {
  const newAnswers = [...props.answers]
  newAnswers[index] = value
  emit('update:answers', newAnswers)
}
</script>

<style scoped>
.border-error {
  border-color: rgb(var(--v-theme-error)) !important;
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1.2;
  max-width: 80px;
  word-wrap: break-word;
}
</style>
