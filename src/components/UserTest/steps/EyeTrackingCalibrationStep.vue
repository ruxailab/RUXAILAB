<template>

    <CalibrationInProgressModal @close="emit('closeCalibration')" @openCalibration="emit('openCalibration')"
        :isOpen="calibrationInProgress" :isCompleted="calibrationCompleted" />
    <ShowInfo :title="$t('UserTestView.CalibrationStep.title')">
        <template #content>
            <div class="test-content pa-6 rounded-xl text-center">
                <v-icon size="96" color="primary">mdi-eye</v-icon>
                <h2 class="text-h5 font-weight-bold mt-4 text-secondary">
                    {{ $t('UserTestView.CalibrationStep.heading') }}
                </h2>
                <p class="text-body-1 mt-4 mb-4 text-grey-darken-1"
                    v-html="$t('UserTestView.CalibrationStep.description')"></p>
                <p class="text-body-1 mb-4 text-grey-darken-1">
                    {{ $t('UserTestView.CalibrationStep.process') }}
                </p>
                <p class="text-body-1 mb-6 text-grey-darken-1">
                    {{ $t('UserTestView.CalibrationStep.instruction') }}
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
