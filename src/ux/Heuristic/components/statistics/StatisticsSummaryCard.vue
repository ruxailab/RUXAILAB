<template>
  <v-card flat rounded="xl" style="background: #f5f7ff">
    <v-card-title class="subtitleView">
      {{ $t('HeuristicsTestAnswer.titles.statistics') }}
    </v-card-title>
    <v-divider />
    <v-row justify="space-around" class="ma-0">
      <v-col cols="10">
        <v-card class="cardStyle my-6" flat>
          <v-row justify="space-around" class="ma-0">
            <v-col cols="4">
              <v-row justify="center" class="ma-0">
                <v-card-title class="mt-4">
                  {{
                    $t('HeuristicsTestAnswer.statistics.usabilityPercentage')
                  }}
                </v-card-title>
                <v-card-text>
                  <v-row align="center" justify="center">
                    <p class="text-h2">
                      {{ result.average }}
                    </p>
                  </v-row>
                </v-card-text>
              </v-row>
            </v-col>
            <v-divider vertical />
            <v-col>
              <v-list class="bg-transparent">
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-arrow-up-bold-hexagon-outline</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t('HeuristicsTestAnswer.statistics.max') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-right">
                    {{ result.max }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-arrow-down-bold-hexagon-outline</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t('HeuristicsTestAnswer.statistics.min') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-right">
                    {{ result.min }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-plus-minus</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ $t('HeuristicsTestAnswer.statistics.std') }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-right">
                    {{ result.sd }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { watch, onMounted } from 'vue'

// Receives the final result object from the parent
// { average, max, min, sd }
const props = defineProps({
  result: {
    type: Object,
    required: true,
    default: () => ({ average: '0%', max: '0%', min: '0%', sd: '0%' }),
  },
})

// Debug: Ver el contenido de result
onMounted(() => {
  console.log('=== StatisticsSummaryCard - result inicial ===')
  console.log('result:', props.result)
  console.log('average:', props.result?.average)
  console.log('max:', props.result?.max)
  console.log('min:', props.result?.min)
  console.log('sd:', props.result?.sd)
  console.log('===========================================')
})

watch(
  () => props.result,
  (newResult) => {
    console.log('=== StatisticsSummaryCard - result actualizado ===')
    console.log('result:', newResult)
    console.log('average:', newResult?.average)
    console.log('max:', newResult?.max)
    console.log('min:', newResult?.min)
    console.log('sd:', newResult?.sd)
    console.log('===============================================')
  },
  { deep: true },
)
</script>
