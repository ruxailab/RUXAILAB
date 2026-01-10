<template>
  <div class="sart-container pa-4">
    <h3 class="text-h5 mb-2">{{ $t('sartLong') }}</h3>
    <p class="text-caption mb-6">{{ $t('sartCalculationExplanation') }}</p>

    <v-divider class="mb-6"></v-divider>

    <div class="mb-4">
      <div class="d-flex justify-space-between mb-1">
        <span class="font-weight-medium">{{ $t('sartDemand') }}</span>
        <span class="text-primary font-weight-bold">{{ answers.demand }}</span>
      </div>
      <v-slider v-model="answers.demand" min="1" max="7" step="1" ticks="always" thumb-label></v-slider>
    </div>

    <div class="mb-4">
      <div class="d-flex justify-space-between mb-1">
        <span class="font-weight-medium">{{ $t('sartSupply') }}</span>
        <span class="text-primary font-weight-bold">{{ answers.supply }}</span>
      </div>
      <v-slider v-model="answers.supply" min="1" max="7" step="1" ticks="always" thumb-label></v-slider>
    </div>

    <div class="mb-6">
      <div class="d-flex justify-space-between mb-1">
        <span class="font-weight-medium">{{ $t('sartUnderstanding') }}</span>
        <span class="text-primary font-weight-bold">{{ answers.understanding }}</span>
      </div>
      <v-slider v-model="answers.understanding" min="1" max="7" step="1" ticks="always" thumb-label></v-slider>
    </div>

    <v-btn color="primary" block size="large" @click="submit">
      {{ $t('common.submit') || 'Submit' }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'SartStep',
  // FIX: This declaration is required to resolve the 'require-explicit-emits' error
  emits: ['submit'],
  data: () => ({
    answers: {
      demand: 4,
      supply: 4,
      understanding: 4
    }
  }),
  methods: {
    submit() {
      // SA = Understanding - (Demand - Supply)
      const saScore = this.answers.understanding - (this.answers.demand - this.answers.supply);
      this.$emit('submit', {
        instrument: 'sart',
        data: this.answers,
        score: saScore
      });
    }
  }
}
</script>