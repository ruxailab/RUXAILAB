<template>
  <PageWrapper
    :title="$t('Final Report')"
    :loading="loading"
    :loading-text="$t('HeuristicsReport.messages.reports_loading')"
    :side-gap="true"
  >
      <!-- Subtitle Slot -->
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Prepare the final report for the heuristic evaluation
      </p>
    </template>
  <div class="finalReportView">
    <v-container>
      <v-stepper
        :model-value="step"
        style="background-color:#F5F7FF"
        class="final-report-box rounded pt-0 mb-4"
        elevation="0"
      >
        <v-stepper-header
          style="background-color: #F5F7FF;"
          class="pt-2"
        >
          <v-stepper-item
            :complete="value > 1"
            value="1"
            color="orange"
          >
            Report Conclusion
          </v-stepper-item>
          <v-divider />
          <v-stepper-item
            :complete="value > 2"
            value="2"
            color="orange"
          >
            Generate Report
          </v-stepper-item>
        </v-stepper-header>

        <v-stepper-window
          style="background-color:#F5F7FF"
          class="mt-0"
        >
          <v-stepper-window-item
            value="1"
            class="align-mid pt-5 min-h-500"
          >
            <div v-if="loading">
              Saving Conclusion on Test....
            </div>
            <div
              v-else
              class=" container"
            >
              <div class="row">
                <TextControls />
              </div>

              <div class="row">
                <div class="col">
                  <div
                    id="myTextarea"
                    contenteditable
                    class="form-control"
                  />
                </div>
              </div>
              <v-row
                class="ma-0"
                justify="end"
              >
                <v-btn
                  class="mt-4"
                  align="right"
                  color="orange"
                  elevation="0"
                  @click="handleNext"
                >
                  {{ $t('buttons.next') }}
                </v-btn>
              </v-row>
            </div>
          </v-stepper-window-item>

          <v-stepper-window-item
            value="2"
            class="align-mid pt-5 min-h-500"
          >
            <FinalReportSelectionBox @return-step="step--" />
          </v-stepper-window-item>
        </v-stepper-window>
      </v-stepper>
    </v-container>
  </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import TextControls from '@/ux/Heuristic/components/FinalReportControls.vue';
import FinalReportSelectionBox from '@/ux/Heuristic/components/FinalReportSelectionBox.vue';
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';


const store = useStore();

const step = ref(0);
const object = ref({});

const loading = ref(false)

const test = computed(() => store.getters.test);

const setInnerHtml = () => {
  const textarea = document.getElementById('myTextarea');
  if (textarea) {
    textarea.innerHTML = test.value.studyConclusion || '';
  }
};

const update = async () => {
  const contenteditable = document.getElementById('myTextarea');
  const text = contenteditable.innerHTML;

  object.value.studyConclusion = text;
  const rawData = { ...test.value, ...object.value };
  const updatedTest = instantiateStudyByType(rawData.testType, rawData);
  await store.dispatch('updateStudy', updatedTest);
  await store.dispatch('getStudy', { id: test.value.id })
};

const handleNext = async () => {
  loading.value = true
  await update();
  loading.value = false
  step.value++;
};

onMounted(() => {
  setInnerHtml();
});
</script>

<style scoped>

.form-control {
  background-color: white;
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12) !important;
  width: 100%;
  height: 55vh;
  resize: none;
  padding: 20px;
  border-radius: 12px;
  overflow: auto;
  font-size: small;
}

</style>