<template>
  <div class="stepper-panel-content">
    <div v-if="!caller" class="moderator-notice">
      <v-chip size="small" color="orange" class="mb-4">
        <v-icon start size="16">mdi-information</v-icon>
        {{ $t('videoCall.panel.moderatorOnlySteps') }}
      </v-chip>
    </div>

    <div class="custom-stepper">
      <div
        class="step-item"
        :class="{
          'step-active': currentStepperValue === 0,
          'step-completed': completedSteps.consent,
          'step-clickable': caller,
        }"
        @click="caller && goToStep('consent')"
      >
        <div class="step-indicator">
          <div class="step-number">
            <v-icon v-if="completedSteps.consent" color="white" size="16">
              mdi-check
            </v-icon>
            <span v-else>1</span>
          </div>
          <div v-if="currentStepperValue >= 1" class="step-line"></div>
        </div>
        <div class="step-content">
          <h4 class="step-title">Consent</h4>
          <p class="step-description">User consent and agreement</p>
        </div>
      </div>

      <div
        class="step-item"
        :class="{
          'step-active': currentStepperValue === 1,
          'step-completed': completedSteps.preTest,
          'step-clickable': caller,
        }"
        @click="caller && goToStep('pretest')"
      >
        <div class="step-indicator">
          <div class="step-number">
            <v-icon v-if="completedSteps.preTest" color="white" size="16">
              mdi-check
            </v-icon>
            <span v-else>2</span>
          </div>
          <div v-if="currentStepperValue >= 2" class="step-line"></div>
        </div>
        <div class="step-content">
          <h4 class="step-title">Pre-test</h4>
          <p class="step-description">Initial questionnaire</p>
        </div>
      </div>

      <div
        class="step-item"
        :class="{
          'step-active': currentStepperValue === 2,
          'step-completed': completedSteps.tasks,
          'step-clickable': caller,
        }"
        @click="caller && goToStep('tasks')"
      >
        <div class="step-indicator">
          <div class="step-number">
            <v-icon v-if="completedSteps.tasks" color="white" size="16">
              mdi-check
            </v-icon>
            <span v-else>3</span>
          </div>
          <div v-if="currentStepperValue >= 3" class="step-line"></div>
        </div>
        <div class="step-content">
          <h4 class="step-title">Tasks</h4>
          <p class="step-description">User testing tasks</p>

          <div
            v-if="
              currentStepperValue === 2 &&
              caller &&
              test?.testStructure?.userTasks
            "
            class="tasks-dropdown mt-3"
          >
            <v-select
              :items="taskDropdownItems"
              :model-value="currentTaskIndex"
              item-title="title"
              item-value="index"
              variant="outlined"
              density="compact"
              hide-details
              class="task-selector"
              placeholder="Select a task"
              prepend-inner-icon="mdi-format-list-bulleted"
              @update:model-value="goToSpecificTask"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps" :title="item.raw.title">
                  <template #prepend>
                    <v-icon
                      size="20"
                      :color="
                        item.raw.completed
                          ? 'success'
                          : item.raw.index === currentTaskIndex
                            ? 'primary'
                            : 'grey'
                      "
                    >
                      {{
                        item.raw.completed
                          ? 'mdi-check-circle'
                          : item.raw.index === currentTaskIndex
                            ? 'mdi-play-circle'
                            : 'mdi-circle-outline'
                      }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </div>
        </div>
      </div>

      <div
        class="step-item"
        :class="{
          'step-active': currentStepperValue === 3,
          'step-completed': completedSteps.postTest,
          'step-clickable': caller,
        }"
        @click="caller && goToStep('posttest')"
      >
        <div class="step-indicator">
          <div class="step-number">
            <v-icon v-if="completedSteps.postTest" color="white" size="16">
              mdi-check
            </v-icon>
            <span v-else>4</span>
          </div>
          <div v-if="currentStepperValue >= 4" class="step-line"></div>
        </div>
        <div class="step-content">
          <h4 class="step-title">Post-test</h4>
          <p class="step-description">Final questionnaire</p>
        </div>
      </div>

      <div
        class="step-item"
        :class="{
          'step-active': currentStepperValue === 4,
          'step-completed': completedSteps.completion,
          'step-clickable': caller,
        }"
        @click="caller && goToStep('completion')"
      >
        <div class="step-indicator">
          <div class="step-number">
            <v-icon v-if="completedSteps.completion" color="white" size="16">
              mdi-check
            </v-icon>
            <span v-else>5</span>
          </div>
        </div>
        <div class="step-content">
          <h4 class="step-title">Completion</h4>
          <p class="step-description">Test finished</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  caller: Boolean,
  currentStepperValue: Number,
  taskDropdownItems: { type: Array, default: () => [] },
  currentTaskIndex: Number,
  test: Object,
  goToStep: Function,
  goToSpecificTask: Function,
  completedSteps: {
    type: Object,
    default: () => ({
      consent: false,
      preTest: false,
      tasks: false,
      postTest: false,
      completion: false,
    }),
  },
})
</script>

<style scoped src="./videoCallShared.css"></style>
