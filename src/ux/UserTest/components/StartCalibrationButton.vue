<template>
    <v-col cols="12" class="text-center">
        <v-btn v-if="!calibrationInProgress" color="primary" variant="flat" size="large"
            @click="$emit('openCalibration')">
            Start calibration
        </v-btn>
        <v-btn v-else disabled color="primary" variant="flat" size="large">
            In progress...
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