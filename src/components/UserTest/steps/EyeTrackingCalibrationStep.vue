<template>

    <CalibrationInProgressModal @close="emit('closeCalibration')" @openCalibration="emit('openCalibration')"
        :isOpen="calibrationInProgress" :isCompleted="calibrationCompleted" />
    <ShowInfo title="Eye Tracking Calibration">
        <template #content>
            <div class="test-content pa-6 rounded-xl text-center">
                <v-icon size="96" color="primary">mdi-eye</v-icon>
                <h2 class="text-h5 font-weight-bold mt-4 text-secondary">
                    Before starting the calibration
                </h2>
                <p class="text-body-1 mt-4 mb-4 text-grey-darken-1">
                    We are going to prepare your device to <strong>record the movement of your eyes</strong>.
                    This will allow us to understand how you navigate the screen during the test.
                </p>
                <p class="text-body-1 mb-4 text-grey-darken-1">
                    The calibration consists of following with your gaze some points that will appear on the screen.
                    It is important that you position yourself in a well-lit place, sit comfortably, and keep your head stable.
                </p>
                <p class="text-body-1 mb-6 text-grey-darken-1">
                    When you are ready, press the button to start the calibration.
                </p>
                <StartCalibrationButton :calibrationInProgress="calibrationInProgress"
                    @openCalibration="emit('openCalibration')" />
            </div>
        </template>
    </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue';
import CalibrationInProgressModal from '@/ux/UserTest/components/CalibrationInProgressModal.vue';
import StartCalibrationButton from '@/ux/UserTest/components/StartCalibrationButton.vue';

const emit = defineEmits(['done', 'openCalibration', 'closeCalibration']);

const props = defineProps({
    calibrationInProgress: {
        type: Boolean,
        default: false
    },
    calibrationCompleted: {
        type: Boolean,
        default: false
    }
});

</script>
