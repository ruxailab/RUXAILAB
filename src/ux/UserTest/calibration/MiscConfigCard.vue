<template>
    <v-container>
        <v-col>
            <v-card flat>
                <v-card-title class="text-h5 font-weight-bold mb-4"
                    :style="{ color: $vuetify.theme.current.colors['on-surface'] }">
                    Miscelaneous configuration
                </v-card-title>
                <div class="custom-outline">
                    Control:
                    <v-checkbox v-model="customColors" label="Use Custom Colors" color="black"></v-checkbox>
                </div>
                <div v-if="customColors">
                    <div class="custom-outline">
                        Background Color:
                        <v-color-picker v-model="backgroundColor" hide-inputs></v-color-picker>
                    </div>
                    <div class="custom-outline">
                        Point Color:
                        <v-color-picker v-model="pointColor" hide-inputs></v-color-picker>
                    </div>
                </div>
                <div class="custom-outline">
                    Model Selection:
                    <v-select v-model="selectedModel" :items="availableModels" outlined
                        placeholder="Select Model"></v-select>
                </div>
                <div class="custom-outline">
                    <b>Note:</b> The selected model will be used for the calibration process. The default model is
                    Linear Regression. Some models may take longer to train than others. So please be patient.
                </div>
            </v-card>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useStore } from "vuex";
import EyeCalibrationSettings from "../models/EyeCalibrationSettings";

const store = useStore();

// refs locais
const backgroundColor = ref("#FFFFFFFF");
const pointColor = ref("#000000FF");
const customColors = ref(false);
const selectedModel = ref("Linear Regression");

const availableModels = [
    "Linear Regression",
    "Ridge Regression",
    "Lasso Regression",
    "Elastic Net",
    "Bayesian Ridge",
    "SGD Regressor",
    "Support Vector Regressor",
];

const getCalibrationConfig = () => {
    const calibrationConfig =
        store.getters.test.calibrationConfig instanceof EyeCalibrationSettings
            ? store.getters.test.calibrationConfig
            : new EyeCalibrationSettings();

    store.commit("SET_CALIBRATION_CONFIG", calibrationConfig);

    backgroundColor.value = calibrationConfig.backgroundColor || "#FFFFFFFF";
    pointColor.value = calibrationConfig.pointColor || "#000000FF";
    customColors.value = calibrationConfig.customColors || false;
    selectedModel.value = calibrationConfig.models || "Linear Regression";
};

const updateCalibrationConfig = () => {
    const calibrationConfig = new EyeCalibrationSettings({
        ...store.getters.test.calibrationConfig,
        backgroundColor: backgroundColor.value,
        pointColor: pointColor.value,
        customColors: customColors.value,
        models: selectedModel.value,
    });

    store.commit("SET_CALIBRATION_CONFIG", calibrationConfig);
};

// watchers para atualizar store ao mudar qualquer valor
watch([backgroundColor, pointColor, customColors, selectedModel], () => {
    updateCalibrationConfig();
});

onMounted(() => {
    getCalibrationConfig();
});
</script>


<style scoped>
.custom-outline {
    border: 1px solid #000;
    padding: 10px;
    border-radius: 5px;
    margin: 10px;
}
</style>