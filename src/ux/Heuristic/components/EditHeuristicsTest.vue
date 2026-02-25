<template>
  <div>
    <v-tabs
      bg-color="transparent"
      color="#FCA326"
      class="pb-0 mb-0 responsive-tabs"
    >
      <v-tab class="tab-content" @click="tabClicked(0)">
        {{ $t('HeuristicsEditTest.titles.heuristics') }}
        <v-icon v-if="index === 0" class="tab-icon"> mdi-chevron-down </v-icon>
      </v-tab>

      <v-tab class="tab-content" @click="tabClicked(1)">
        {{ $t('HeuristicsEditTest.titles.options') }}
        <v-icon v-if="index === 1" class="tab-icon"> mdi-chevron-down </v-icon>
      </v-tab>

      <v-tab class="tab-content" @click="tabClicked(2)">
        {{ $t('HeuristicsEditTest.titles.weights') }}
        <v-icon v-if="index === 2" class="tab-icon"> mdi-chevron-down </v-icon>
      </v-tab>

      <v-tab class="tab-content" @click="tabClicked(3)">
        {{ $t('HeuristicsEditTest.titles.settings') }}
        <v-icon v-if="index === 3" class="tab-icon"> mdi-chevron-down </v-icon>
      </v-tab>
    </v-tabs>

    <div class="mt-responsive">
      <HeuristicsTable v-if="index == 0" @change="emit('change')" />
      <OptionsTable v-if="index == 1" />
      <WeightTable v-if="index == 2" />
      <HeuristicsSettings v-if="index == 3" />
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import HeuristicsTable from '@/ux/Heuristic/components/HeuristicsTable.vue'
import OptionsTable from '@/ux/Heuristic/components/OptionsTable.vue'
import HeuristicsSettings from '@/ux/Heuristic/components/HeuristicsSettings.vue'
import WeightTable from '@/ux/Heuristic/components/weights_evaluation/WeightTable.vue'

defineProps({
  type: {
    type: String,
    required: true,
  },
  object: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['tabClicked', 'change'])

const tabClicked = (index) => {
  emit('tabClicked', index)
}
</script>

<style scoped>
/* Mobile-responsive styles */
@media (max-width: 960px) {
  .responsive-tabs {
    margin-top: 16px;
    padding: 6px;
    height: auto;
    border: 1px solid #9e9e9e;
    border-radius: 4px;
  }

  .responsive-tabs :deep(.v-tabs-slider) {
    display: none;
  }

  .responsive-tabs :deep(.v-tabs-bar) {
    height: auto;
    flex-direction: column;
  }

  .responsive-tabs :deep(.v-tabs-bar__content) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .responsive-tabs :deep(.v-tab) {
    min-width: 100%;
    justify-content: space-between;
    padding-left: 0;
    text-align: left;
    font-size: 16px;
  }

  .tab-content {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .tab-icon {
    width: 20px;
    height: 20px;
    display: block;
  }

  .responsive-tabs :deep(.v-slide-group__wrapper) {
    overflow: visible;
  }

  .mt-responsive {
    margin-top: 16px;
  }
}

/* Desktop-responsive styles */
@media (min-width: 960px) {
  .tab-icon {
    display: none;
    /* Hide icon on larger screens */
  }
}
</style>
