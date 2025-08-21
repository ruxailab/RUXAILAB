<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <div class="d-flex align-center mb-4">
      <span class="text-subtitle-1">Progreso: {{ completedCount }}/10</span>
      <v-progress-linear
        class="ml-4"
        :model-value="(completedCount / 10) * 100"
        :color="completedCount === 10 ? 'success' : 'primary'"
      />
    </div>
    <v-card
      v-for="(question, i) in susQuestions"
      :key="i"
      variant="outlined"
      :class="{ 'my-2': true, 'border-error': !answers[i] }"
    >
      <v-card-text>
        <span :class="{ 'text-error': !answers[i] }">{{ question }} *</span>
        <v-divider class="my-2" />

        <!-- Aquí sí funciona correctamente -->
        <v-radio-group
          v-model="answers[i]"
          inline
        >
          <v-radio
            v-for="n in 5"
            :key="n"
            :value="n"
            class="d-flex flex-column align-center mx-6"
          >
            <template #label>
              <div class="text-center mt-1">
                {{ susLabels[n - 1] }}
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  taskIndex: {
    type: Number,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => Array(10).fill(undefined)
  }
});

const emit = defineEmits(['update:modelValue']);

const store = useStore();
const form = ref(null);
const valid = ref(false);

// Contador de respuestas completadas
const completedCount = computed(() => {
  return answers.value.filter(answer => typeof answer === 'number').length;
});

// Respuestas locales reactivas usando v-model
const answers = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue);
  }
});

const susLabels = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

const susQuestions = [
  "I think that I would like to use this system frequently.",
  "I found the system unnecessarily complex.",
  "I thought the system was easy to use.",
  "I think that I would need the support of a technical person to be able to use this system.",
  "I found the various functions in this system were well integrated.",
  "I thought there was too much inconsistency in this system.",
  "I would imagine that most people would learn to use this system very quickly.",
  "I found the system very cumbersome to use.",
  "I felt very confident using the system.",
  "I needed to learn a lot of things before I could get going with this system.",
];
</script>
