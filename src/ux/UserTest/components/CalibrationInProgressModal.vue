<template>
    <v-dialog v-model="dialogVisible" persistent max-width="1000" min-height="500">
        <v-card rounded="xl" class="pa-8 text-center">
            <v-card-title class="text-h4 font-weight-bold">
                {{ isCompleted ? 'Calibration completed!' : 'Waiting for calibration...' }}
            </v-card-title>

            <v-card-text class="mt-14 d-flex flex-column align-center justify-center">
                <div class="mb-4 text-h6" v-if="!isCompleted">
                    Calibrating, please wait...
                </div>

                <div>
                    <v-progress-circular v-if="!isCompleted" indeterminate color="primary" size="56" width="5" />
                    <v-icon v-else color="success" size="100">
                        mdi-check
                    </v-icon>
                </div>
                <div class="text-subtitle-1 mt-auto" v-if="!isCompleted">
                    The calibration didn't open? <a @click="$emit('openCalibration')" class="openCalib">Click here</a>
                </div>

                <div class="text-subtitle-1 mt-auto" v-else>
                    The calibration was successful!
                    <br>
                    <v-btn class="mt-4" color="primary" @click="$emit('close')">
                        CONTINUE TO THE TEST!
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['openCalibration', 'close']);

const dialogVisible = computed({
    get: () => props.isOpen,
    set: () => { },
});
</script>

<style scoped>
.openCalib {
    justify-self: end;
    cursor: pointer;
    text-decoration: underline;
    color: rgb(10, 35, 61);
}
</style>
