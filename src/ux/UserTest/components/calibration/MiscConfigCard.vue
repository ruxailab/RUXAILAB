<template>
  <v-container>
    <v-col>
      <v-card flat>
        <v-card-title
          class="text-h5 font-weight-bold mb-4"
          :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
        >
          {{ $t('EyeTrackingConfig.titles.miscellaneous') }}
        </v-card-title>
        <div class="custom-outline">
          {{ $t('EyeTrackingConfig.labels.control') }}
          <v-checkbox
            v-model="customColors"
            :label="$t('EyeTrackingConfig.labels.useCustomColors')"
            color="black"
          ></v-checkbox>
        </div>
        <div v-if="customColors">
          <div class="custom-outline">
            {{ $t('EyeTrackingConfig.labels.backgroundColor') }}
            <v-color-picker
              v-model="backgroundColor"
              hide-inputs
            ></v-color-picker>
          </div>
          <div class="custom-outline">
            {{ $t('EyeTrackingConfig.labels.pointColor') }}
            <v-color-picker v-model="pointColor" hide-inputs></v-color-picker>
          </div>
        </div>
        <div class="custom-outline">
          {{ $t('EyeTrackingConfig.labels.modelSelection') }}
          <v-select
            v-model="selectedModel"
            :items="availableModels"
            variant="outlined"
            item-title="title"
            item-value="value"
            :placeholder="$t('EyeTrackingConfig.labels.selectModel')"
          />
        </div>
        <div class="custom-outline">
          <b>{{ $t('EyeTrackingConfig.labels.note') }}</b>
          {{ $t('EyeTrackingConfig.labels.noteText') }}
        </div>
      </v-card>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import EyeCalibrationSettings from '@/ux/UserTest/models/EyeCalibrationSettings'

const { t } = useI18n()

const store = useStore()

// refs locais
const backgroundColor = ref('#FFFFFFFF')
const pointColor = ref('#000000FF')
const customColors = ref(false)
const selectedModel = ref('Linear Regression')

const availableModels = computed(() => [
  { title: t('EyeTrackingConfig.models.linear'), value: 'Linear Regression' },
  { title: t('EyeTrackingConfig.models.ridge'), value: 'Ridge Regression' },
  { title: t('EyeTrackingConfig.models.lasso'), value: 'Lasso Regression' },
  { title: t('EyeTrackingConfig.models.elastic'), value: 'Elastic Net' },
  { title: t('EyeTrackingConfig.models.bayesian'), value: 'Bayesian Ridge' },
  { title: t('EyeTrackingConfig.models.sgd'), value: 'SGD Regressor' },
  {
    title: t('EyeTrackingConfig.models.svr'),
    value: 'Support Vector Regressor',
  },
  {
    title: t('EyeTrackingConfig.models.rfr'),
    value: 'Random Forest Regressor',
  },
])

/**
 * Data Ingestion: Loads configuration from Vuex store.
 */
const getCalibrationConfig = () => {
  const calibrationConfig =
    store.getters.test.calibrationConfig instanceof EyeCalibrationSettings
      ? store.getters.test.calibrationConfig
      : new EyeCalibrationSettings()

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)

  backgroundColor.value = calibrationConfig.backgroundColor || '#FFFFFFFF'
  pointColor.value = calibrationConfig.pointColor || '#000000FF'
  customColors.value = calibrationConfig.customColors || false
  selectedModel.value = calibrationConfig.models || 'Linear Regression'
}

/**
 * State Synchronization: Persists UI changes back to the global store.
 */
const updateCalibrationConfig = () => {
  const calibrationConfig = new EyeCalibrationSettings({
    ...store.getters.test.calibrationConfig,
    backgroundColor: backgroundColor.value,
    pointColor: pointColor.value,
    customColors: customColors.value,
    models: selectedModel.value,
  })

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)
}

// watchers para atualizar store ao mudar qualquer valor
watch([backgroundColor, pointColor, customColors, selectedModel], () => {
  updateCalibrationConfig()
})

onMounted(() => {
  getCalibrationConfig()
})
</script>

<style scoped>
.custom-outline {
  border: 1px solid #000;
  padding: 10px;
  border-radius: 5px;
  margin: 10px;
}
</style>
