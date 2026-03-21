<template>
  <div class="study-variations-manager mt-6">
    <!-- Header Section -->
    <div class="d-flex align-center mb-6">
      <v-avatar color="primary-lighten-5" size="48" class="mr-4">
        <v-icon icon="mdi-flask-outline" color="primary" size="24" />
      </v-avatar>
      <div>
        <h3 class="text-h6 font-weight-bold color-primary">
          {{ t('studyCreation.ab.variationsTitle') }}
        </h3>
        <p class="text-body-2 text-grey-darken-1">
          {{ t('studyCreation.ab.variationsSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Variants List -->
    <v-row>
      <v-col
        v-for="(variant, index) in variations"
        :key="variant.id"
        cols="12"
      >
        <v-card
          variant="outlined"
          class="variant-card pa-5 pb-6"
          :class="{ 'border-error': showErrors && !variant.url }"
          elevation="0"
        >
          <v-row align="start" no-gutters>
            <!-- Variant Header (Letter Indicator) -->
            <v-col cols="12" class="mb-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="28" class="mr-3 elevation-2">
                  <span class="text-caption font-weight-black text-white">
                    {{ getCharFromIndex(index) }}
                  </span>
                </v-avatar>
                <span class="text-subtitle-1 font-weight-bold text-grey-darken-3">
                  {{ variant.name }}
                </span>
              </div>
              
              <!-- Delete Button -->
              <v-btn
                v-if="variations.length > 2"
                icon="mdi-close-circle-outline"
                color="grey-lighten-1"
                variant="text"
                size="small"
                class="hover-red"
                @click="removeVariation(variant.id)"
              />
            </v-col>

            <!-- Inputs Row -->
            <v-col cols="12">
              <v-row dense>
                <!-- URL Input -->
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="variant.url"
                    :label="t('studyCreation.ab.urlLabel')"
                    :placeholder="t('studyCreation.ab.urlPlaceholder')"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    prepend-inner-icon="mdi-link-variant"
                    color="primary"
                    class="rounded-lg"
                    :error="!variant.url && showErrors"
                    :error-messages="(!variant.url && showErrors) ? t('studyCreation.ab.urlRequired') : ''"
                    @update:model-value="emitUpdate"
                  />
                </v-col>

                <!-- Traffic Percentage -->
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="variant.traffic"
                    :label="t('studyCreation.ab.trafficLabel')"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    suffix="%"
                    min="0"
                    max="100"
                    prepend-inner-icon="mdi-chart-donut"
                    color="primary"
                    class="rounded-lg"
                    @update:model-value="v => handleTrafficInput(variant, v)"
                  />
                  
                  <!-- Visual Distribution Indicator -->
                  <v-progress-linear
                    :model-value="trafficPercentage(variant.traffic)"
                    height="8"
                    :color="totalTraffic === 100 ? 'primary' : 'warning'"
                    rounded
                    :stream="false"
                    :striped="false"
                    class="mt-3 mx-1"
                    style="transition: all 0.3s ease;"
                  />
                  <div class="text-caption font-weight-medium text-grey-darken-1 mt-1 px-1 text-right">
                    {{ trafficPercentage(variant.traffic) }}%
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Footer Controls -->
    <div class="d-flex flex-column flex-sm-row justify-space-between align-center mt-6 pa-2 bg-grey-lighten-4 rounded-xl">
      <v-btn
        color="primary"
        variant="elevated"
        prepend-icon="mdi-plus-circle"
        rounded="pill"
        elevation="2"
        class="px-6"
        @click="addVariation"
        :disabled="variations.length >= 5"
      >
        {{ t('studyCreation.ab.addVariant') }}
      </v-btn>

      <div class="d-flex align-center mt-4 mt-sm-0 px-4">
        <span class="text-overline font-weight-bold text-grey-darken-1 mr-3">
          {{ t('studyCreation.ab.totalTraffic') }}
        </span>
        <v-chip
          :color="totalTraffic === 100 ? 'success' : 'error'"
          class="font-weight-black px-4"
          variant="flat"
          size="large"
        >
          {{ totalTraffic }}%
        </v-chip>
      </div>
    </div>
    
    <v-fade-transition>
      <div v-if="totalTraffic !== 100 && showErrors" class="text-error text-caption mt-3 d-flex align-center justify-end px-2">
        <v-icon icon="mdi-alert-circle-outline" size="14" class="mr-1" />
        {{ t('studyCreation.ab.trafficError') }}
      </div>
    </v-fade-transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { nanoid } from 'nanoid'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  showErrors: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:isValid'])

// Internal State
const variations = ref([])

// Initialize from props or set default A/B
onMounted(() => {
  if (props.modelValue && props.modelValue.length > 0) {
    variations.value = JSON.parse(JSON.stringify(props.modelValue))
  } else {
    // Default starting state: 50/50 split
    variations.value = [
      { id: nanoid(), name: t('studyCreation.ab.variantLabel', { char: 'A' }), url: '', traffic: 50 },
      { id: nanoid(), name: t('studyCreation.ab.variantLabel', { char: 'B' }), url: '', traffic: 50 }
    ]
    emitUpdate()
  }
})

// Watch external changes
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(variations.value)) {
    // Sync if values changed externally
    variations.value = JSON.parse(JSON.stringify(newVal || []))
  }
}, { deep: true })

// Computed
const totalTraffic = computed(() => {
  return variations.value.reduce((sum, v) => sum + (Number(v.traffic) || 0), 0)
})

const isValid = computed(() => {
  const isTrafficValid = totalTraffic.value === 100
  const areUrlsValid = variations.value.length >= 2 && variations.value.every(v => 
    typeof v.url === 'string' && v.url.trim().length > 0
  )
  return isTrafficValid && areUrlsValid
})

watch(isValid, (valid) => {
  emit('update:isValid', valid)
}, { immediate: true })

// Methods
const getCharFromIndex = (index) => {
  return String.fromCharCode(65 + index) // 0 -> A, 1 -> B, 2 -> C
}

const trafficPercentage = (traffic) => {
  return Math.max(0, Math.min(100, Number(traffic) || 0))
}

/**
 * Automatically redistributes traffic evenly across all variants.
 */
const redistributeTraffic = () => {
  const count = variations.value.length
  if (count === 0) return

  const baseTraffic = Math.floor(100 / count)
  const remainder = 100 % count

  variations.value.forEach((v, i) => {
    v.traffic = baseTraffic + (i === count - 1 ? remainder : 0)
  })
}

/**
 * Enforces traffic range [0, 100] and updates the parent.
 */
const handleTrafficInput = (variant, value) => {
  const cleanedValue = Math.min(100, Math.max(0, Number(value) || 0))
  variant.traffic = cleanedValue
  emitUpdate()
}

const addVariation = () => {
  if (variations.value.length >= 5) return

  const newIndex = variations.value.length
  const char = getCharFromIndex(newIndex)
  
  variations.value.push({
    id: nanoid(),
    name: t('studyCreation.ab.variantLabel', { char }),
    url: '',
    traffic: 0
  })
  
  redistributeTraffic()
  emitUpdate()
}

const removeVariation = (id) => {
  if (variations.value.length <= 2) return // Minimum A/B required
  variations.value = variations.value.filter(v => v.id !== id)
  
  redistributeTraffic()
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(variations.value)))
}
</script>

<style scoped>
.study-variations-manager {
  max-width: 900px;
  margin: 0 auto;
}

.variant-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 16px;
  background-color: #fcfcfc;
  border: 1px solid #eeeeee;
}

.variant-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  background-color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.hover-red:hover {
  color: rgb(var(--v-theme-error)) !important;
}

.border-error {
  border-color: rgb(var(--v-theme-error)) !important;
  background-color: #fff9f9;
}

.color-primary {
  color: rgb(var(--v-theme-primary));
}

.rounded-lg :deep(.v-field__outline) {
  --v-field-border-opacity: 0.15;
}

.v-field--focused :deep(.v-field__outline) {
  --v-field-border-opacity: 1;
}
</style>
