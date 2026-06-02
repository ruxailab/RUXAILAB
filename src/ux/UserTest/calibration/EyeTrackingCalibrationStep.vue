<template>
  <CalibrationInProgressModal
    :is-open="calibrationInProgress"
    :is-completed="calibrationCompleted"
    @close="emit('closeCalibration')"
    @open-calibration="emit('openCalibration')"
  />
  <ShowInfo :title="$t('UserTestView.CalibrationStep.title')">
    <template #content>
      <div class="test-content pa-6 rounded-xl text-center">
        <v-icon size="96" color="primary">mdi-eye</v-icon>
        <h2 class="text-h5 font-weight-bold mt-4 text-secondary">
          {{ $t('UserTestView.CalibrationStep.heading') }}
        </h2>
        <p
          class="text-body-1 mt-4 mb-4 text-grey-darken-1"
          v-html="$t('UserTestView.CalibrationStep.description')"
        ></p>
        <p class="text-body-1 mb-4 text-grey-darken-1">
          {{ $t('UserTestView.CalibrationStep.process') }}
        </p>
        <p class="text-body-1 mb-6 text-grey-darken-1">
          {{ $t('UserTestView.CalibrationStep.instruction') }}
        </p>
        <StartCalibrationButton
          :calibration-in-progress="calibrationInProgress"
          @open-calibration="emit('openCalibration')"
        />

        <v-btn
          v-if="canSkipCalibration"
          variant="text"
          color="secondary"
          class="mt-2"
          @click="handleSkipCalibration"
        >
          <v-icon start>mdi-skip-next</v-icon>
          {{ $t('UserTestView.CalibrationStep.reuseSkipButton') }}
        </v-btn>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import CalibrationInProgressModal from '@/ux/UserTest/components/CalibrationInProgressModal.vue'
import StartCalibrationButton from '@/ux/UserTest/components/StartCalibrationButton.vue'

const store = useStore()
const user = computed(() => store.getters.user)

const canSkipCalibration = computed(() => {
  return user.value && user.value.calibrationId
})

const emit = defineEmits(['done', 'openCalibration', 'closeCalibration'])

const props = defineProps({
  calibrationInProgress: {
    type: Boolean,
    default: false,
  },
  calibrationCompleted: {
    type: Boolean,
    default: false,
  },
})

const handleSkipCalibration = () => {
  emit('closeCalibration')
}
</script>
