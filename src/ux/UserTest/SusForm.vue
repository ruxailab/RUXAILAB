<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <!-- Information header -->
    <v-card 
      variant="outlined" 
      color="primary" 
      class="mb-6"
    >
      <v-card-text class="text-center">
        <v-icon 
          size="48" 
          color="primary" 
          class="mb-2"
        >
          mdi-clipboard-list-outline
        </v-icon>
        <h3 class="text-h6 font-weight-bold text-primary mb-2">
          System Usability Scale (SUS)
        </h3>
        <p class="text-body-2 text-grey-darken-3 mb-2">
          Please evaluate the system you just used by answering the following <strong>10 questions</strong>. 
          Rate each statement on a scale from <strong>Strongly Disagree</strong> to <strong>Strongly Agree</strong>.
        </p>
        <p class="text-body-2 text-grey-darken-3">
          Your honest feedback helps us understand the usability of the system. All questions are required.
        </p>
      </v-card-text>
    </v-card>

    <!-- Progress indicator -->
    <div class="d-flex align-center mb-4">
      <span class="text-subtitle-1">Progress: {{ completedCount }}/10</span>
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
