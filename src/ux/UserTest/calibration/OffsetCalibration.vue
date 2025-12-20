<template>
    <v-row class="d-flex align-center">
        <v-col cols="8">
            <v-tooltip text="Offset (in pixels) to adjust the calibration area position." location="bottom">
                <template #activator="{ props }">
                    <v-slider v-bind="props" v-model="offset" :min="100" :max="300" step="5" label="Offset"
                        thumb-label />
                </template>
            </v-tooltip>
        </v-col>
        <v-col cols="4" style="max-width: 100%; max-height: 100%; display: flex; align-items: stretch;">
            <canvas ref="offCanvas" style="width: 100%; height: 100%;"></canvas>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useStore } from "vuex";
import EyeCalibrationSettings from "../models/EyeCalibrationSettings";

const store = useStore();

const offset = computed({
    get: () => store.getters.test?.calibrationConfig?.offset ?? 100,
    set: (val) => {
        const config = new EyeCalibrationSettings({
            ...store.getters.test.calibrationConfig,
            offset: val
        });
        store.commit('SET_CALIBRATION_CONFIG', config);
        drawOffset();
    }
});

const pointNumber = computed({
    get: () => store.getters.test?.calibrationConfig?.pointNumber ?? 8,
    set: (val) => {
        const config = new EyeCalibrationSettings({
            ...store.getters.test.calibrationConfig,
            pointNumber: val
        });
        store.commit('SET_CALIBRATION_CONFIG', config);
        drawOffset();
    }
});

const backgroundColor = computed({
    get: () => store.getters.test?.calibrationConfig?.backgroundColor ?? '#FFFFFFFF',
    set: (val) => {
        const config = new EyeCalibrationSettings({
            ...store.getters.test.calibrationConfig,
            backgroundColor: val
        });
        store.commit('SET_CALIBRATION_CONFIG', config);
        drawOffset();
    }
});


const offCanvas = ref(null);

const getCalibrationConfig = () => {
    const calibrationConfig =
        store.getters.test.calibrationConfig instanceof EyeCalibrationSettings
            ? store.getters.test.calibrationConfig
            : new EyeCalibrationSettings();

    store.commit("SET_CALIBRATION_CONFIG", calibrationConfig);

    offset.value = calibrationConfig.offset ?? 100;
    pointNumber.value = calibrationConfig.pointNumber ?? 8;
    backgroundColor.value = calibrationConfig.backgroundColor ?? "#FFFFFFFF";
};

const updateCalibrationConfig = (pattern = null) => {
    const calibrationConfig = new EyeCalibrationSettings({
        ...store.getters.test.calibrationConfig,
        offset: offset.value,
        pointNumber: pointNumber.value,
        backgroundColor: backgroundColor.value,
        ...(pattern && { pattern }),
    });

    store.commit("SET_CALIBRATION_CONFIG", calibrationConfig);
};

const generatePoints = (offsetX, offsetY, width, height, pointNum) => {
    const possiblePatterns = [
        [{ x: offsetX, y: height - offsetY }, { x: width - offsetX, y: offsetY }],
        [
            { x: offsetX, y: height - offsetY },
            { x: width / 2, y: height / 2 },
            { x: width - offsetX, y: offsetY },
        ],
        [
            { x: offsetX, y: offsetY },
            { x: width - offsetX, y: offsetY },
            { x: offsetX, y: height - offsetY },
            { x: width - offsetX, y: height - offsetY },
        ],
        [
            { x: offsetX, y: offsetY },
            { x: width - offsetX, y: offsetY },
            { x: width / 2, y: height / 2 },
            { x: offsetX, y: height - offsetY },
            { x: width - offsetX, y: height - offsetY },
        ],
        [
            { x: offsetX, y: offsetY },
            { x: offsetX, y: height / 2 },
            { x: offsetX, y: height - offsetY },
            { x: width - offsetX, y: offsetY },
            { x: width - offsetX, y: height / 2 },
            { x: width - offsetX, y: height - offsetY },
        ],
        [
            { x: offsetX, y: offsetY },
            { x: offsetX, y: height / 2 },
            { x: offsetX, y: height - offsetY },
            { x: width / 2, y: height / 2 },
            { x: width - offsetX, y: offsetY },
            { x: width - offsetX, y: height / 2 },
            { x: width - offsetX, y: height - offsetY },
        ],
        [
            { x: offsetX, y: offsetY },
            { x: offsetX, y: height / 2 },
            { x: offsetX, y: height - offsetY },
            { x: width / 2, y: offsetY },
            { x: width / 2, y: height - offsetY },
            { x: width - offsetX, y: offsetY },
            { x: width - offsetX, y: height / 2 },
            { x: width - offsetX, y: height - offsetY },
        ],
        [
            { x: offsetX, y: offsetY },
            { x: offsetX, y: height / 2 },
            { x: offsetX, y: height - offsetY },
            { x: width / 2, y: offsetY },
            { x: width / 2, y: height / 2 },
            { x: width / 2, y: height - offsetY },
            { x: width - offsetX, y: offsetY },
            { x: width - offsetX, y: height / 2 },
            { x: width - offsetX, y: height - offsetY },
        ],
    ];
    return possiblePatterns.find((p) => p.length === pointNum) || [];
};

const drawOffset = () => {
    if (!offCanvas.value) return;

    const canvas = offCanvas.value;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const xFac = canvas.width / window.innerWidth;
    const yFac = canvas.height / window.innerHeight;

    const trueOffsetX = offset.value * xFac;
    const trueOffsetY = offset.value * yFac;

    const canvasCalib = generatePoints(
        trueOffsetX,
        trueOffsetY,
        canvas.width,
        canvas.height,
        pointNumber.value
    );

    const trueCalib = generatePoints(
        offset.value,
        offset.value,
        window.innerWidth,
        window.innerHeight,
        pointNumber.value
    );

    updateCalibrationConfig(trueCalib);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    canvasCalib.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    });
};

// watchers
watch([offset, pointNumber, backgroundColor], () => {
    drawOffset();
});

onMounted(() => {
    getCalibrationConfig();
    drawOffset();
});
</script>