<template>
    <v-col cols="12">
        <v-card flat rounded="xl" class="dataCard ma-0 pa-0">
            <v-row class="fill-height" align="center" justify="center">
                <v-col cols="12">
                    <v-row justify="center">
                        <h1 style="color: #455a64;" class="mt-6">
                            Eye-tracking calibration
                        </h1>
                    </v-row>
                </v-col>
            </v-row>
            <v-divider class="my-4" />
            <v-row class="fill-height" align="center" justify="center">
                <v-col cols="12" class="mx-auto" align="center">
                    <span class="text-subtitle-1">Start here the calibration process, to use eye tracking
                        correctly</span>

                </v-col>
                <v-col cols="12" class="mx-auto mb-4" align="center">
                    <v-btn v-if="!calibrationInProgress" @click="$emit('openCalibration')" color="success">
                        Continue
                    </v-btn>
                    <v-btn v-else disabled color="success">
                        In Progress
                    </v-btn>
                </v-col>
            </v-row>
        </v-card>
    </v-col>
</template>

<script setup>
const props = defineProps({
    calibrationInProgress: {
        type: Boolean,
        default: false
    }
})
</script>
