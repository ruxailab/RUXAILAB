<template>
  <v-container class="container-max-width">
    <v-row justify="center">
      <v-col
        cols="12"
        class="text-center mb-6"
      >
        <h1 class="text-h4 font-weight-bold text-primary">
          WCAG Accessibility Guidelines
        </h1>
        <div class="text-subtitle-1 text-grey-darken-1">
          Web Content Accessibility Guidelines Documentation
        </div>
      </v-col>

      <v-col cols="12">
        <v-card class="elevation-2 mb-12">
          <v-expansion-panels
            v-model="openPrinciple"
            multiple
          >
            <v-expansion-panel
              v-for="(principle, index) in flattenedWcagData"
              :key="index"
              class="principle-panel"
            >
              <v-expansion-panel-title class="py-4">
                <div>
                  <div class="d-flex flex-wrap align-center">
                    <div class="principle-number mr-3">
                      {{ index + 1 }}
                    </div>
                    <h2 class="text-h5 font-weight-bold mb-0">
                      {{ Object.values(principle)[0].title }}
                    </h2>
                  </div>
                  <div class="text-subtitle-1 text-grey-darken-2 mt-2">
                    {{ Object.values(principle)[0].description }}
                  </div>
                </div>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <v-expansion-panels
                  v-model="openGuidelines[index]"
                  multiple
                  class="mt-3"
                >
                  <v-expansion-panel
                    v-for="guideline in Object.values(principle)[0].Guidelines"
                    :key="guideline.id"
                    class="guideline-panel"
                  >
                    <v-expansion-panel-title class="py-3">
                      <div>
                        <div class="d-flex flex-wrap align-center">
                          <div class="guideline-id font-weight-medium mr-2">
                            {{ guideline.id }}
                          </div>
                          <div class="text-h6 font-weight-medium">
                            {{ guideline.title }}
                          </div>
                        </div>
                        <div class="text-body-2 text-grey-darken-1 mt-1">
                          {{ guideline.description }}
                        </div>
                      </div>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text>
                      <v-card
                        v-for="rule in guideline.Rules"
                        :key="rule.id"
                        class="mb-4 rule-card"
                        border
                      >
                        <v-card-title class="py-3">
                          <v-row align="center">
                            <v-col
                              cols="12"
                              sm="8"
                            >
                              <div class="d-flex align-center">
                                <div class="rule-id mr-2">
                                  {{ rule.id }}
                                </div>
                                <div class="text-subtitle-1 font-weight-bold">
                                  {{ rule.title }}
                                </div>
                              </div>
                            </v-col>
                            <v-col
                              cols="12"
                              sm="4"
                              class="text-sm-right"
                            >
                              <v-chip
                                :color="getLevelColor(rule.level)"
                                size="small"
                                class="font-weight-medium text-white"
                              >
                                Level {{ rule.level }}
                              </v-chip>
                              <v-chip
                                color="grey-darken-1"
                                class="ml-2 text-white"
                                size="small"
                              >
                                v{{ rule.version }}
                              </v-chip>
                            </v-col>
                          </v-row>
                        </v-card-title>

                        <v-divider />

                        <v-card-text class="pa-4">
                          <v-list
                            density="compact"
                            class="bg-transparent"
                          >
                            <v-list-item
                              v-for="(criterion, i) in rule.criteria"
                              :key="i"
                              class="px-0"
                            >
                              <template #prepend>
                                <v-icon :color="getLevelColor(rule.level)">
                                  mdi-check-circle
                                </v-icon>
                              </template>
                              <v-list-item-title class="text-body-1">
                                {{ criterion }}
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import wcagData from '@/assets/WacgAxe.json';

const openPrinciple = ref([]);
const openGuidelines = ref({});
const stateWcagData = ref(wcagData);

// Initialize openGuidelines for each wcagData entry
stateWcagData.value.forEach((_, index) => {
  openGuidelines.value[index] = [];
});

const getLevelColor = (level) => {
  const colors = {
    A: 'error',
    AA: 'warning darken-1',
    AAA: 'success darken-1',
  };
  return colors[level] || 'primary';
};
</script>

<style scoped>
.container-max-width {
  max-width: 1200px;
  margin: 0 auto;
}

.principle-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--v-primary-base);
  color: white;
  font-weight: bold;
}

.principle-panel {
  margin-bottom: 12px;
}

.guideline-panel {
  margin-bottom: 8px;
}

.guideline-id {
  color: var(--v-primary-base);
}

.rule-id {
  color: var(--v-primary-darken1);
  font-weight: 500;
}

.rule-card {
  border-left: 4px solid var(--v-primary-lighten3) !important;
  transition: all 0.2s ease;
}

.rule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
