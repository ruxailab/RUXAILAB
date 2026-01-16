<template>
  <PageWrapper
    title="Edit Test"
    :side-gap="true"
  >
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Customize the settings and preferences of your test
      </p>
    </template>

    <v-container>
      <ButtonSave
        :visible="change"
        @click="save"
      />

      <div>
        <!-- Desktop Tabs -->
        <v-tabs
          v-if="!isMobile"
          bg-color="transparent"
          color="#FCA326"
          class="pb-0 mb-0"
          v-model="index"
        >
          <v-tab>{{ $t('HeuristicsEditTest.titles.heuristics') }}</v-tab>
          <v-tab>{{ $t('HeuristicsEditTest.titles.options') }}</v-tab>
          <v-tab>{{ $t('HeuristicsEditTest.titles.weights') }}</v-tab>
          <v-tab>{{ $t('HeuristicsEditTest.titles.settings') }}</v-tab>
        </v-tabs>

        <!-- Mobile Select Dropdown -->
        <v-select
          v-else
          v-model="index"
          :items="tabItems"
          variant="outlined"
          density="compact"
          class="mobile-tab-select"
          prepend-inner-icon="mdi-menu"
          hide-details
        >
          <template #selection="{ item }">
            <div class="d-flex align-center justify-space-between w-100">
              <span class="font-weight-medium">{{ item.title }}</span>
              <!-- <v-icon size="small">mdi-chevron-down</v-icon> -->
            </div>
          </template>
        </v-select>

        <div class="mt-4">
          <HeuristicsTable
            v-if="index == 0"
            @change="change = true"
          />
          <OptionsTable
            v-if="index == 1"
            @change="change = true"
          />
          <WeightTable v-if="index == 2" />
          <HeuristicsSettings v-if="index == 3" />
        </div>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import ButtonSave from '@/shared/components/buttons/ButtonSave.vue';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import HeuristicsTable from '../components/HeuristicsTable.vue';
import OptionsTable from '../components/OptionsTable.vue';
import WeightTable from '../components/weights_evaluation/WeightTable.vue';
import HeuristicsSettings from '../components/HeuristicsSettings.vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions';

const store = useStore();
const route = useRoute();

const index = ref(0);
const change = ref(false);
const windowWidth = ref(window.innerWidth);

// Tab items for mobile dropdown
const tabItems = computed(() => [
  { title: 'HEURISTICS', value: 0 },
  { title: 'OPTIONS', value: 1 },
  { title: 'WEIGHTS', value: 2 },
  { title: 'SETTINGS', value: 3 },
]);

// Check if mobile
const isMobile = computed(() => windowWidth.value < 960);

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const save = async () => {
  change.value = false;

  const rawData = {
    ...store.getters.test,
    testStructure: store.getters.heuristics,
    testOptions: store.state.Tests.Test.testOptions,
    testWeights: store.getters.testWeights
  };

  const study = instantiateStudyByType(rawData.testType, rawData);
  await store.dispatch('updateStudy', study);
  await store.dispatch('getStudy', { id: route.params.id })
}
</script>

<style scoped>
/* Mobile styles */
.mobile-tab-select {
  margin-bottom: 16px;
}

/* Ensure proper spacing on all devices */
@media (max-width: 960px) {
  .v-container {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>