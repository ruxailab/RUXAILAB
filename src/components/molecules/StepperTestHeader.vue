<template>
  <v-row
    class="stepper-row sticky-stepper"
  >
    <v-col cols="12">
      <v-stepper
        :model-value="stepperValue"
        class="main-stepper rounded-xl elevation-3"
        style="visibility:visible"
      >
        <v-stepper-header>
          <v-stepper-item
            value="1"
            title="Consent"
            :complete="stepperValue >= 1"
            :color="stepperValue < 1 ? 'primary' : 'success'"
            complete-icon="mdi-check"
          />
          <v-divider />
          <v-stepper-item
            value="2"
            title="Pre-test"
            :complete="stepperValue >= 2"
            :color="stepperValue < 2 ? 'primary' : 'success'"
            complete-icon="mdi-check"
          />
          <v-divider />
          <v-stepper-item
            value="3"
            title="Tasks"
            :complete="stepperValue >= 3"
            :color="stepperValue < 3 ? 'primary' : 'success'"
            complete-icon="mdi-check"
          />
          <v-divider />
          <v-stepper-item
            value="4"
            title="Post-test"
            :complete="stepperValue >= 4"
            :color="stepperValue < 4 ? 'primary' : 'success'"
            complete-icon="mdi-check"
          />
          <v-divider />
          <v-stepper-item
            value="5"
            title="Completion"
            :complete="stepperValue === 5"
            :color="stepperValue < 5 ? 'primary' : 'success'"
            complete-icon="mdi-check"
          />
        </v-stepper-header>
      </v-stepper>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex'

// Props
const props = defineProps({
  stepperValue: {
    type: Number,
    required: true
  }
})

// Stores
const store = useStore()

// Computed
const test = computed(() => store.getters.test)
</script>
