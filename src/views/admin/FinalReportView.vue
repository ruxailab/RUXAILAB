<template>
  <div class="finalReportView">
    <v-container v-if="test.testType === 'HEURISTICS'">
      <ShowInfo
        style="padding: 0!important;"
        :title="$t('titles.drawer.Final Report')"
      />

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

    <v-container
      v-else-if="test.testType === 'User'"
      fluid
      fill-height
      class="mt-10"
    >
      <v-row>
        <v-col class="text-center">
          <v-icon
            size="100"
            color="primary"
            class="mb-4"
          >
            mdi-tools
          </v-icon>
          <h1 class="text-h4">
            {{ $t('pages.finalReport.ConstructionHeading') }}
          </h1>
          <p class="text-subtitle-1">
            {{ $t('pages.finalReport.ConstructionParagraph') }}
          </p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import TextControls from '@/components/atoms/FinalReportControls.vue';
import FinalReportSelectionBox from '@/components/atoms/FinalReportSelectionBox.vue';
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import Test from '@/models/Test';

const store = useStore();

const step = ref(0);
const object = ref({});

const loading = ref(false)

const test = computed(() => store.getters.test);

const setInnerHtml = () => {
  const textarea = document.getElementById('myTextarea');
  if (textarea) {
    textarea.innerHTML = test.value.finalReport || '';
  }
};

const update = async () => {
  const contenteditable = document.getElementById('myTextarea');
  const text = contenteditable.innerHTML;

  object.value.finalReport = text;
  const updatedTest = new Test({ ...test.value, ...object.value });
  await store.dispatch('updateTest', updatedTest);
  await store.dispatch('getTest', { id: test.value.id })
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
.teste {
  position: fixed;
  right: 8%;
  bottom: 10%;
}

.final-report-box {
  background-color: whitesmoke;
  width: 100%;
  padding: 0;
}

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

.min-h-500 {
  min-height: 500px;
}
</style>