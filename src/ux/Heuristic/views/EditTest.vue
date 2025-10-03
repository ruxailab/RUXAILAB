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
        <v-tabs
          bg-color="transparent"
          color="#FCA326"
          class="pb-0 mb-0 responsive-tabs"
        >
          <v-tab
            class="tab-content"
            @click="index = 0"
          >
            {{ $t('HeuristicsEditTest.titles.heuristics') }}
            <v-icon
              v-if="index === 0"
              class="tab-icon"
            >
              mdi-chevron-down
            </v-icon>
          </v-tab>

          <v-tab
            class="tab-content"
            @click="index = 1"
          >
            {{ $t('HeuristicsEditTest.titles.options') }}
            <v-icon
              v-if="index === 1"
              class="tab-icon"
            >
              mdi-chevron-down
            </v-icon>
          </v-tab>

          <v-tab
            class="tab-content"
            @click="index = 2"
          >
            {{ $t('HeuristicsEditTest.titles.weights') }}
            <v-icon
              v-if="index === 2"
              class="tab-icon"
            >
              mdi-chevron-down
            </v-icon>
          </v-tab>

          <v-tab
            class="tab-content"
            @click="index = 3"
          >
            {{ $t('HeuristicsEditTest.titles.settings') }}
            <v-icon
              v-if="index === 3"
              class="tab-icon"
            >
              mdi-chevron-down
            </v-icon>
          </v-tab>
        </v-tabs>

        <div class="mt-responsive">
          <HeuristicsTable
            v-if="index == 0"
            @change="change = true"
          />
          <OptionsTable
            v-if="index == 1"
            @change="change = true"
          />
          <WeightTable v-if="index == 2" />
          <HeuristicsSenttings v-if="index == 3" />
        </div>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import ButtonSave from '@/shared/components/buttons/ButtonSave.vue';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';
import { ref } from 'vue';
import HeuristicsTable from '../components/HeuristicsTable.vue';
import OptionsTable from '../components/OptionsTable.vue';
import WeightTable from '../components/weights_evaluation/WeightTable.vue';
import HeuristicsSenttings from '../components/HeuristicsSenttings.vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions';

const store = useStore();
const route = useRoute();

const index = ref(0);
const change = ref(false);

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
    display: none; /* Hide icon on larger screens */
  }
}
</style>
