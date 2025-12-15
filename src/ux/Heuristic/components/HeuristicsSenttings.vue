<template>
  <v-container
    fluid
    class="pa-6"
  >
    <v-card
      elevation="2"
      class="pa-6"
    >
      <div>
        <!-- Header Section -->
        <h1 class="text-h4 font-weight-bold text-on-surface mb-4">
          {{ $t('HeuristicsSettings.titles.settings') }}
        </h1>
        <v-divider class="mb-6" />

        <!-- Download CSV Template -->
        <div class="mb-8">
          <v-btn
            color="accent"
            variant="elevated"
            size="large"
            class="text-none"
            @click="downloadTemplate"
          >
            {{ $t('HeuristicsSettings.actions.downloadCsvTemplate') }}
          </v-btn>
        </div>

        <!-- File Upload Section -->
        <div>
          <v-row
            align="center"
            class="mb-4"
          >
            <v-col cols="10">
              <v-file-input
                ref="myFile"
                v-model="csvFile"
                accept=".csv"
                :label="$t('HeuristicsSettings.placeHolders.importCsv')"
                variant="outlined"
                density="comfortable"
                prepend-icon=""
                prepend-inner-icon="mdi-paperclip"
                show-size
                truncate-length="15"
                :disabled="testAnswerDocLength > 0"
                counter
              >
              </v-file-input>
            </v-col>
            <v-col cols="2" class="pb-8">
              <v-btn
                :loading="loadingUpdate"
                :disabled="loadingUpdate || testAnswerDocLength > 0"
                color="primary"
                variant="elevated"
                class="text-none"
                @click="changeToJSON"
              >
                <v-icon start>
                  mdi-cloud-upload
                </v-icon>
                {{ $t('HeuristicsSettings.actions.update') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-alert
            v-if="errorMessage"
            v-model="errorVisible"
            type="error"
            density="compact"
            class="mt-2"
            closable
          >
            {{ errorMessage }}
          </v-alert>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

const store = useStore();
const toast = useToast();
const { t } = useI18n();

const loading = ref(false);
const loader = ref(null);
const csvFile = ref(null);
const myFile = ref(null);
const loadingUpdate = ref(false);
const errorMessage = ref('');
const errorVisible = ref(false);

const test = computed(() => store.getters.test);

const testAnswerDocLength = computed(() => {
  const doc = store.getters.testAnswerDocument;
  return Object.keys(doc?.heuristicAnswers ?? {}).length;
});

watch(loader, (newLoader) => {
  if (newLoader) {
    loading.value = !loading.value;
    if (csvFile.value) {
      setTimeout(() => {
        loading.value = false;
        csvFile.value = null;
      }, 3000);
      loader.value = null;
    } else {
      setTimeout(() => {
        loading.value = false;
      }, 3000);
      toast.warning(t('HeuristicsSettings.messages.noCsvFileSelected'));
      loader.value = null;
    }
  }
});

watch(csvFile, () => {
  if (errorMessage.value) {
    errorMessage.value = '';
    errorVisible.value = false;
  }
});

const changeToJSON = async () => {
  if (!csvFile.value) {
    toast.warning(t('HeuristicsSettings.messages.noCsvFileSelected'));
    return;
  }

  if (!csvFile.value.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = t('HeuristicsSettings.messages.invalidFileType');
    errorVisible.value = true;
    return;
  }

  const confirmationText = t('HeuristicsSettings.messages.acceptCsv');
  if (!confirm(confirmationText)) return;

  loadingUpdate.value = true;
  errorMessage.value = '';
  errorVisible.value = false;

  try {
    const reader = new FileReader();
    reader.readAsText(csvFile.value, 'UTF-8');

    reader.onload = async () => {
      try {
        const csv = reader.result?.trim();
        if (!csv) {
          errorMessage.value = t('HeuristicsSettings.messages.emptyCsvFile');
          errorVisible.value = true;
          return;
        }

        const lines = csv.split(/\r?\n/).filter(l => l.trim() !== '');

        // ---- delimiter detection (SAFE) ----
        const firstLine = lines[0];
        let delimiter = ';';
        if (firstLine.includes(',')) delimiter = ',';
        if (firstLine.includes('\t')) delimiter = '\t';

        const heuristicMap = new Map();

        // ---- detect if first row is header ----
        const firstCols = firstLine.split(delimiter).map(c => c.trim().toLowerCase());
        const hasHeader =
          firstCols.some(c => c.includes('heuristic')) &&
          firstCols.some(c => c.includes('question'));

        const startIndex = hasHeader ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map(c => c.trim());
          if (cols.length < 4) continue;

          const heuristicIdRaw = cols[0];
          const heuristicTitle = cols[1];
          const questionIdRaw = cols[2];
          const questionText = cols[3];

          if (!heuristicTitle || !questionText) continue;

          const heuristicKey = heuristicIdRaw || heuristicTitle;

          if (!heuristicMap.has(heuristicKey)) {
            heuristicMap.set(heuristicKey, {
              id: heuristicMap.size,
              title: heuristicTitle,
              questions: [],
              total: 0,
            });
          }

          const heuristic = heuristicMap.get(heuristicKey);

          heuristic.questions.push({
            id: questionIdRaw ? Number(questionIdRaw) - 1 : heuristic.questions.length,
            title: questionText,
            descriptions: [],
            comparison: [],
            text: questionText,
            answerImageUrl: '',
          });

          heuristic.total = heuristic.questions.length;
        }

        const heuristicTest = Array.from(heuristicMap.values());

        if (!heuristicTest.length) {
          errorMessage.value = 'No valid data found in CSV file';
          errorVisible.value = true;
          return;
        }

        store.state.Tests.Test.testStructure = heuristicTest;
        await store.dispatch('updateStudy', test.value);

        toast.success(`${csvFile.value.name} uploaded`);
        csvFile.value = null;
      } finally {
        loadingUpdate.value = false;
      }
    };
  } catch (error) {
    console.error('Update action failed:', error);
    errorMessage.value = t('HeuristicsSettings.messages.updateFailed');
    errorVisible.value = true;
    loadingUpdate.value = false;
  }
};


const downloadTemplate = async () => {
  const storage = getStorage();
  const starsRef = storageRef(storage, 'template-csv/heuristic-template.csv');
  try {
    const url = await getDownloadURL(starsRef);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Download template failed:', error);
    switch (error.code) {
      case 'storage/object-not-found':
        errorMessage.value = t('HeuristicsSettings.messages.templateNotFound');
        break;
      case 'storage/unauthorized':
        errorMessage.value = t('HeuristicsSettings.messages.unauthorizedAccess');
        break;
      case 'storage/canceled':
        errorMessage.value = t('HeuristicsSettings.messages.downloadCanceled');
        break;
      case 'storage/unknown':
        errorMessage.value = t('HeuristicsSettings.messages.unknownError');
        break;
    }
    errorVisible.value = true;
  }
};
</script>

<style scoped>

:deep(.v-file-input .v-field) {
  background-color: #F8FAFC;
}

:deep(.v-btn--variant-elevated) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.v-btn--variant-elevated:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
