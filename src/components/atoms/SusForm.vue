<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-card
      v-for="i in susQuestions.length"
      :key="i"
      variant="outlined"
      class="my-2"
    >
      <v-col>
        <span>{{ susQuestions[i-1] }}</span>
        <v-divider class="my-2" />
        <v-radio-group
          :model-value="susAnswers[i - 1]"
          inline
          @update:model-value="(val) => emit('update-answer', { index: i - 1, value: val })"
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
      </v-col>
    </v-card>
  </v-form>
</template>

<script setup>
import { ref } from "vue";

defineProps({
    susAnswers: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['update-answer']);

const form = ref(null);
const valid = ref(false);

const susLabels = [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
]

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
    "I needed to learn a lot of things before I could get going with this system."
];
</script>