<template>
  <div
    id="FileUpload"
    class="rounded"
    style="background-color:#f5f7ff"
  >
    <v-card-title class="subtitleView">
      {{ $t('HeuristicsSettings.titles.settings') }}
    </v-card-title>
    <v-divider class="mb-4" />
    <v-col justify="center">
      <v-row class="px-6 ">
        <v-btn
          variant="flat"
          color="orange"
          class="ma-2"
          @click="downloadTemplate"
        >
          {{ $t('HeuristicsSettings.actions.downloadCsvTemplate') }}
        </v-btn>
      </v-row>
      <v-divider class="ma-8" />
      <v-row>
        <v-row
          class="px-8 mb-2"
          justify="center"
          align="center"
        >
          <v-file-input
            ref="myFile"
            v-model="csvFile"
            accept=".csv"
            show-size
            truncate-length="15"
            placeholder="$t('HeuristicsSettings.placeHolders.importCsv')"
            :disabled="testAnswerDocLength > 0"
          />
          <v-btn
            :loading="loadingUpdate"
            :disabled="loadingUpdate || testAnswerDocLength > 0"
            color="blue-grey"
            class="ma-3 text-white"
            @click="changeToJSON"
          >
            {{ $t('HeuristicsSettings.actions.update') }}
            <v-icon
              end
            >
              mdi-cloud-upload
            </v-icon>
          </v-btn>
        </v-row>  
      </v-row>
      <v-alert
        v-if="errorMessage"
        type="error"
        density="compact"
        class="ma-2"
      >
        {{ errorMessage }}
      </v-alert>  
    </v-col>
  </div>
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
const heuristicForm = ref(null);
const myFile = ref(null); // Ref for the file input
const loadingUpdate = ref(false);
const errorMessage = ref('');

const test = computed(() => store.getters.test);
const user = computed(() => store.getters.user);
const csvHeuristics = computed(() => store.state.Tests.currentTest);
const testAnswerDocLength = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return 0;
  }
  const heuristicAnswers = store.getters.testAnswerDocument.heuristicAnswers;
  return Object.keys(heuristicAnswers).length;
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

const changeToJSON = async () => {
  if (!csvFile.value) {
    errorMessage.value = t('HeuristicsSettings.messages.noCsvFileSelected');
    return;
  }

  if (!csvFile.value.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = t('HeuristicsSettings.messages.invalidFileType');
    return;
  }

  loadingUpdate.value = true;
  errorMessage.value = '';

  try {
    const confirmationText = t('HeuristicsSettings.messages.acceptCsv');
    if (confirm(confirmationText)) {
      const reader = new FileReader();
      reader.readAsText(csvFile.value, 'UTF-8');
      reader.onload = async () => {
        const csv = reader.result.trim();

        if (!csv) {
          errorMessage.value = t('HeuristicsSettings.messages.emptyCsvFile');
          loadingUpdate.value = false;
          return;
        }

        const lines = csv.split('\r\n');
        const headers = lines[0].split(';').map((header) => header.trim());
        const heuristicMap = new Map();

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i];
          if (!currentLine) continue;

          const currentFields = currentLine.split(';');

          const heuristicId = currentFields[0];
          const heuristicTitle = currentFields[1];
          const questionId = currentFields[2];
          const questionText = currentFields[3];

          if (!heuristicMap.has(heuristicId)) {
            heuristicMap.set(heuristicId, {
              id: parseInt(heuristicId) - 1,
              title: heuristicTitle,
              questions: [],
              total: 0,
            });
          }

          const heuristicEntry = heuristicMap.get(heuristicId);
          heuristicEntry.questions.push({
            id: parseInt(questionId) - 1,
            title: questionText,
            descriptions: questionText,
            text: questionText,
            answerImageUrl: '',
          });

          heuristicEntry.total = Math.max(
            heuristicEntry.total,
            parseInt(questionId)
          );
        }

        const heuristicTest = Array.from(heuristicMap.values());

        store.state.Tests.Test.testStructure = heuristicTest;
        await store.dispatch('updateTest', test.value);
      };
    }
  } catch (error) {
    console.error('Update action failed:', error);
  } finally {
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
    switch (error.code) {
      case 'storage/object-not-found':
        // File doesn't exist
        break;
      case 'storage/unauthorized':
        // User doesn't have permission to access the object
        break;
      case 'storage/canceled':
        // User canceled the upload
        break;
      case 'storage/unknown':
        // Unknown error occurred, inspect the server response
        break;
    }
  }
};
</script>

<style scoped>
.csv-box {
  background-color: white;
}
.subtitleView {
  font-family: 'Poppins', Helvetica;
  font-style: normal;
  font-weight: 500;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
</style>