<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-container>
      <v-row
        v-for="(label, key) in labels"
        :key="key"
        dense
      >
        <v-col cols="12">
          <v-card
            variant="outlined"
            class="pa-4"
          >
            <div class="d-flex justify-space-between mb-1">
              <span class="font-weight-medium">{{ label.title }}</span>
              <span class="text-caption text-grey">{{ label.subtitle }}</span>
            </div>
            <v-slider
              v-model="localNasaTlx[key]"
              :max="100"
              :step="5"
              track-color="grey-lighten-2"
              color="black"
              thumb-color="black"
            />
            <div class="d-flex justify-space-between text-caption mt-1">
              <span>{{ label.left }}</span>
              <span>{{ label.right }}</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';

const props = defineProps({
  nasaTlx: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['update:nasaTlx']);

const localNasaTlx = reactive({ ...props.nasaTlx });

watch(() => props.nasaTlx, (newVal) => {
  Object.assign(localNasaTlx, newVal);
});

watch(localNasaTlx, () => {
  const fullUpdate = {};
  for (const key in labels) {
    fullUpdate[key] = localNasaTlx[key] ?? 0;
  }
  emit('update:nasaTlx', fullUpdate);
}, { deep: true });

let valid = ref(false);

const labels = {
  mentalDemand: { title: "Mental Demand", left: "Low", right: "High", subtitle: "How mentally demanding was the task?" },
  physicalDemand: { title: "Physical Demand", left: "Low", right: "High", subtitle: "How physically demanding was the task?" },
  temporalDemand: { title: "Temporal Demand", left: "Low", right: "High", subtitle: "How hurried or rushed was the pace of the task?" },
  performance: { title: "Performance", left: "Good", right: "Poor", subtitle: "How successful were you in accomplishing the task?" },
  effort: { title: "Effort", left: "Low", right: "High", subtitle: "How hard did you have to work to accomplish it?" },
  frustration: { title: "Frustration", left: "Low", right: "High", subtitle: "How stressed, annoyed, or irritated were you?" }
};
</script>

<style scoped>
.v-card {
    background-color: #f5f6fa;
    border-radius: 12px;
}
</style>
