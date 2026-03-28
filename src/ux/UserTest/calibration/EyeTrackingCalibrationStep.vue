<template>
    <CalibrationInProgressModal
      :is-open="calibrationInProgress && !showValidation" 
      :is-completed="calibrationCompleted && !showValidation"
      @close="handleModalClose" 
      @open-calibration="emit('openCalibration')" 
    />
    <ShowInfo v-if="!showValidation" :title="$t('UserTestView.CalibrationStep.title')">
        <template #content>
            <div class="test-content pa-6 rounded-xl text-center">
                <v-icon size="96" color="primary">mdi-eye</v-icon>
                <h2 class="text-h5 font-weight-bold mt-4 text-secondary">
                    {{ $t('UserTestView.CalibrationStep.heading') }}
                </h2>
                <p
class="text-body-1 mt-4 mb-4 text-grey-darken-1"
                    v-html="$t('UserTestView.CalibrationStep.description')"></p>
                <p class="text-body-1 mb-4 text-grey-darken-1">
                    {{ $t('UserTestView.CalibrationStep.process') }}
                </p>
                <p class="text-body-1 mb-6 text-grey-darken-1">
                    {{ $t('UserTestView.CalibrationStep.instruction') }}
                </p>
                <StartCalibrationButton
:calibration-in-progress="calibrationInProgress"
                    @open-calibration="emit('openCalibration')" />
            </div>
        </template>
    </ShowInfo>

    <CalibrationValidation 
      v-if="showValidation && calibrationCompleted"
      @validation-complete="handleValidationComplete"
    />
</template>

<script setup>
import { ref } from 'vue';
import ShowInfo from '@/shared/components/ShowInfo.vue';
import CalibrationInProgressModal from '@/ux/UserTest/components/CalibrationInProgressModal.vue';
import StartCalibrationButton from '@/ux/UserTest/components/StartCalibrationButton.vue';
import CalibrationValidation from './CalibrationValidation.vue';

defineProps({
    calibrationInProgress: {
        type: Boolean,
        default: false
    },
    calibrationCompleted: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['done', 'openCalibration', 'closeCalibration']);
const showValidation = ref(false);

const handleModalClose = () => {
    emit('closeCalibration');
    showValidation.value = true;
};

const handleValidationComplete = (results) => {
    showValidation.value = false;
    emit('done', results);
};

</script>
