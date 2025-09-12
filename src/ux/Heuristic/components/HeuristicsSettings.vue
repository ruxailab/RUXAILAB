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
            type="error"
            density="compact"
            class="mt-2"
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

const emit = defineEmits(['tabChange']);

const store = useStore();
const toast = useToast();
const { t } = useI18n();

const loading = ref(false);
const loader = ref(null);
const csvFile = ref(null);
const myFile = ref(null);
const loadingUpdate = ref(false);
const errorMessage = ref('');

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

const changeToJSON = async () => {
  if (!csvFile.value || (Array.isArray(csvFile.value) && csvFile.value.length === 0)) {
    errorMessage.value = t('HeuristicsSettings.messages.noCsvFileSelected');
    return;
  }

  // Handle both single file and array of files
  const file = Array.isArray(csvFile.value) ? csvFile.value[0] : csvFile.value;
  
  if (!file || !file.name || !file.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = t('HeuristicsSettings.messages.invalidFileType');
    return;
  }

  loadingUpdate.value = true;
  errorMessage.value = '';

  try {
    const confirmationText = t('HeuristicsSettings.messages.acceptCsv');
    if (confirm(confirmationText)) {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
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
        await store.dispatch('updateStudy', test.value);
        
        // Show success message and navigate to HeuristicsTable tab
        toast.success(t('HeuristicsSettings.messages.uploadSuccess'));
        emit('tabChange', 0); // Navigate to tab 0 (HeuristicsTable)
      };
    }
  } catch (error) {
    console.error('Update action failed:', error);
    errorMessage.value = t('HeuristicsSettings.messages.updateFailed');
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
