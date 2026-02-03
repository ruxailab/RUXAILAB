<template>
    <v-col cols="12" class="text-center">
        <v-btn
v-if="!calibrationInProgress" color="primary" variant="flat" size="large"
            @click="$emit('openCalibration')">
            {{ $t('UserTestView.CalibrationStep.startButton') }}
        </v-btn>
        <v-btn v-else disabled color="primary" variant="flat" size="large">
            {{ $t('UserTestView.CalibrationStep.inProgress') }}
        </v-btn>
    </v-col>
</template>

<script setup>
const props = defineProps({
    calibrationInProgress: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['openCalibration']);
</script>