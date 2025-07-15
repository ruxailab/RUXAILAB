<template>
  <v-app>
    <v-main>
      <Snackbar />

      <v-dialog
        v-model="dialog"
        width="600"
        persistent
      >
        <v-card>
          <v-card-title
            class="text-h5 bg-error text-white"
            primary-title
          >
            {{ $t('HeuristicsReport.messages.confirm_delete_report') }}
          </v-card-title>
          <v-card-text>{{ dialogText }}</v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn
              class="bg-grey-lighten-3"
              variant="text"
              @click="dialog = false"
            >
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              class="bg-red text-white ml-1"
              :loading="loadingBtn"
              variant="text"
              @click="removeReport(report), (loadingBtn = true)"
            >
              {{ $t('buttons.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-overlay
        v-model="loading"
        class="text-center"
      >
        <v-progress-circular
          indeterminate
          color="#fca326"
          size="50"
        />
        <div class="text-white mt-3">
          {{ $t('HeuristicsReport.messages.reports_loading') }}
        </div>
      </v-overlay>

      <Intro
        v-if="reports.length === 0 && !loading"
        @go-to-coops="goToCoops"
      />

      <v-container
        v-else
        fluid
        class="pa-8"
      >
        <div class="mb-8">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <h1 class="text-h3 font-weight-bold text-on-surface mb-2">
                Reports Dashboard
              </h1>
              <div class="d-flex align-center">
                <v-icon
                  icon="mdi-update"
                  size="small"
                  class="mr-2 text-medium-emphasis"
                />
                <span class="text-body-2 text-medium-emphasis">
                  Last synced: {{ formatDate(lastUpdated) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex align-center justify-space-between mb-6">
          <div class="d-flex align-center gap-4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Search reports..."
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 500px; min-width: 400px;"
            />
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Filter by status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="min-width: 200px; width: 200px;"
            />
          </div>
          <div class="d-flex align-center gap-2">
            <v-btn-toggle
              v-model="viewMode"
              mandatory
              variant="outlined"
              density="compact"
            >
              <v-btn
                value="cards"
                icon="mdi-view-grid"
              />
              <v-btn
                value="list"
                icon="mdi-view-list"
              />
            </v-btn-toggle>
          </div>
        </div>

        <div v-if="viewMode === 'cards'">
          <v-row>
            <v-col
              v-for="(r) in filteredReports"
              :key="r.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <v-card
                class="report-card"
                elevation="2"
                hover
              >
                <v-card-text class="pa-6">
                  <div class="d-flex align-center mb-4">
                    <v-avatar
                      :color="getAvatarColor(r.evaluator)"
                      size="48"
                      class="mr-4"
                    >
                      <span class="text-white font-weight-bold text-h6">
                        {{ getInitials(r.fullName) }}
                      </span>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-h6 font-weight-bold text-on-surface mb-1">
                        {{ r.fullName }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ r.evaluator }}
                      </div>
                    </div>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          variant="text"
                          size="small"
                          v-bind="props"
                          class="text-medium-emphasis"
                        />
                      </template>
                      <v-list min-width="180">
                        <v-list-item
                          prepend-icon="mdi-delete"
                          title="Remove Report"
                          class="text-error"
                          @click="dialog = true; report = r"
                        />
                      </v-list>
                    </v-menu>
                  </div>

                  <div class="mb-4">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="text-body-2 font-weight-medium text-medium-emphasis">Progress</span>
                      <span class="text-h6 font-weight-bold text-on-surface">{{ r.progress }}%</span>
                    </div>
                    <v-progress-linear
                      :model-value="parseFloat(r.progress)"
                      :color="getProgressColor(parseFloat(r.progress))"
                      height="12"
                      rounded
                      class="mb-2"
                    />
                  </div>

                  <div class="d-flex align-center justify-space-between">
                    <v-chip
                      :color="getStatusColor(r.status)"
                      :text="r.status"
                      variant="flat"
                      size="small"
                      class="text-capitalize font-weight-medium"
                      :prepend-icon="getStatusIcon(r.status)"
                    />
                    <div class="d-flex align-center text-body-2 text-medium-emphasis">
                      <v-icon
                        icon="mdi-clock-outline"
                        size="small"
                        class="mr-1"
                      />
                      {{ r.lastUpdate }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-else>
          <v-card
            elevation="2"
            class="rounded-lg"
          >
            <div class="table-header pa-4">
              <v-row
                no-gutters
                class="align-center"
              >
                <v-col
                  cols="3"
                  class="px-4"
                >
                  <div class="text-subtitle-1 font-weight-bold table-heading-text">
                    Evaluator
                  </div>
                </v-col>
                <v-col
                  cols="2"
                  class="px-4"
                >
                  <div class="text-subtitle-1 font-weight-bold table-heading-text">
                    Last Update
                  </div>
                </v-col>
                <v-col
                  cols="3"
                  class="px-4"
                >
                  <div class="text-subtitle-1 font-weight-bold table-heading-text">
                    Progress
                  </div>
                </v-col>
                <v-col
                  cols="2"
                  class="px-4"
                >
                  <div class="text-subtitle-1 font-weight-bold table-heading-text">
                    Status
                  </div>
                </v-col>
                <v-col
                  cols="2"
                  class="px-4"
                >
                  <div class="text-subtitle-1 font-weight-bold table-heading-text">
                    Actions
                  </div>
                </v-col>
              </v-row>
            </div>
            <v-divider />
            <v-list class="pa-0">
              <template
                v-for="(r, index) in filteredReports"
                :key="r.id"
              >
                <v-list-item class="px-0 py-4">
                  <v-row
                    no-gutters
                    class="align-center"
                  >
                    <v-col
                      cols="3"
                      class="px-4"
                    >
                      <div class="d-flex align-center">
                        <v-avatar
                          :color="getAvatarColor(r.evaluator)"
                          size="40"
                          class="mr-3"
                        >
                          <span class="text-white font-weight-medium">
                            {{ getInitials(r.fullName) }}
                          </span>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-1 font-weight-bold text-on-surface">
                            {{ r.fullName }}
                          </div>
                          <div class="text-body-2 text-medium-emphasis">
                            {{ r.evaluator }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                    <v-col
                      cols="2"
                      class="px-4"
                    >
                      <div class="d-flex align-center">
                        <v-icon
                          icon="mdi-clock-outline"
                          size="small"
                          class="mr-2 text-medium-emphasis"
                        />
                        <span class="text-body-1">{{ r.lastUpdate }}</span>
                      </div>
                    </v-col>
                    <v-col
                      cols="3"
                      class="px-4"
                    >
                      <div class="progress-section">
                        <div class="d-flex align-center justify-space-between mb-2">
                          <span class="text-body-2 font-weight-medium text-medium-emphasis">Progress</span>
                          <span class="text-subtitle-1 font-weight-bold text-on-surface">{{ r.progress }}%</span>
                        </div>
                        <v-progress-linear
                          :model-value="parseFloat(r.progress)"
                          :color="getProgressColor(parseFloat(r.progress))"
                          height="8"
                          rounded
                        />
                      </div>
                    </v-col>
                    <v-col
                      cols="2"
                      class="px-4"
                    >
                      <v-chip
                        :color="getStatusColor(r.status)"
                        :text="r.status"
                        variant="flat"
                        size="small"
                        class="text-capitalize font-weight-medium"
                        :prepend-icon="getStatusIcon(r.status)"
                      />
                    </v-col>
                    <v-col
                      cols="2"
                      class="px-4"
                    >
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-dots-vertical"
                            variant="text"
                            size="small"
                            v-bind="props"
                            class="text-medium-emphasis"
                          />
                        </template>
                        <v-list min-width="180">
                          <v-list-item
                            prepend-icon="mdi-delete"
                            title="Remove Report"
                            class="text-error"
                            @click="dialog = true; report = r"
                          />
                        </v-list>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-list-item>
                <v-divider v-if="index < filteredReports.length - 1" />
              </template>
            </v-list>
          </v-card>
        </div>

        <div
          v-if="filteredReports.length === 0"
          class="text-center py-12"
        >
          <v-icon
            icon="mdi-file-search"
            size="64"
            class="text-medium-emphasis mb-4"
          />
          <h3 class="text-h5 font-weight-medium text-medium-emphasis mb-2">
            No reports found
          </h3>
          <p class="text-body-1 text-medium-emphasis">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/firebase';
import Intro from '@/components/molecules/IntroReports.vue';
import Snackbar from '@/components/atoms/Snackbar.vue';

const store = useStore();
const { t } = useI18n();
const toast = useToast();

const props = defineProps({ id: { type: String, default: '' } });
const emit = defineEmits(['goToCoops']);

const loading = ref(true);
const dialog = ref(false);
const loadingBtn = ref(false);
const report = ref(null);
const searchQuery = ref('');
const statusFilter = ref(null);
const viewMode = ref('list');
const lastUpdated = ref(new Date());

const user = computed(() => store.getters.user);
const test = computed(() => store.getters.test);

const checkIfIsSubmitted = (status) => status ? t('HeuristicsReport.status.submitted') : t('HeuristicsReport.status.in_progress');

const getCooperatorEmail = (userDocId) => {
  if (userDocId === user.value.id) return 'You';
  const cooperators = test.value.cooperators || [];
  const found = cooperators.find((c) => c?.userDocId === userDocId);
  return found?.email || 'Unknown';
};

const formatDate = (timestamp) => {
  const current = new Date();
  const start = new Date(timestamp);
  const diff = {
    years: current.getFullYear() - start.getFullYear(),
    months: current.getMonth() - start.getMonth(),
    days: current.getDate() - start.getDate(),
    hours: current.getHours() - start.getHours(),
    minutes: current.getMinutes() - start.getMinutes(),
  };
  for (const [unit, value] of Object.entries(diff)) {
    if (value > 0) return formatTimeAgo(value, unit);
  }
  return t('common.timeAgo.now');
};

const formatTimeAgo = (count, unit) => t(`common.timeAgo.${unit}`, { count });

const reports = computed(() => {
  const doc = store.getters.testAnswerDocument;
  if (!doc) return [];
  const type = doc.type;
  const raw = type === 'User' ? doc.taskAnswers || {} : doc.heuristicAnswers || {};
  console.log(raw)
  return Object.values(raw).map((r) => ({
    id: r.userDocId,
    fullName: r.fullName,
    evaluator: getCooperatorEmail(r.userDocId),
    userDocId: r.userDocId,
    progress: parseFloat(r.progress).toFixed(2),
    status: checkIfIsSubmitted(r.submitted),
    lastUpdate: formatDate(r.lastUpdate),
  }));
});

const filteredReports = computed(() => {
  return reports.value.filter((r) => {
    const matchQuery = r.fullName?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus = statusFilter.value ? r.status === statusFilter.value : true;
    return matchQuery && matchStatus;
  });
});

const statusOptions = computed(() => [
  t('HeuristicsReport.status.submitted'),
  t('HeuristicsReport.status.in_progress'),
]);

const dialogText = computed(() =>
  t('HeuristicsReport.messages.sure_to_delete', {
    user: report.value ? report.value.evaluator : '',
  })
);

watch(reports, () => {
  if (Object.values(reports.value)) loading.value = false;
});

const getCurrentAnswer = async () => {
  await store.dispatch('getCurrentTestAnswerDoc');
};

const removeReport = async (report) => {
  const answerId = test.value.answersDocId;
  console.log(report)
  const userToRemoveId = report.userDocId;
  let testType = test.value.testType;
  const testId = test.value.id;

  if (testType === 'HEURISTIC') testType = 'heuristicAnswers';
  if (testType === 'User') testType = 'taskAnswers';

  try {
    const userDocRef = doc(db, 'users', userToRemoveId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      await updateDoc(userDocRef, { [`myAnswers.${testId}`]: deleteField() });
    }
    const answerDocRef = doc(db, 'answers', answerId);
    const answerDoc = await getDoc(answerDocRef);
    if (answerDoc.exists()) {
      await updateDoc(answerDocRef, { [`${testType}.${userToRemoveId}`]: deleteField() });
    }
  } catch (e) {
    store.commit('setError', {
      errorCode: 'RemoveReportError',
      message: e,
    });
  }
  await getCurrentAnswer();
  loadingBtn.value = false;
  dialog.value = false;
  toast?.success(t('alerts.genericSuccess'));
};

const goToCoops = () => emit('goToCoops');

const getAvatarColor = (name) => '#3f51b5';
const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?';
const getProgressColor = (progress) => (progress >= 100 ? 'success' : 'primary');
const getStatusColor = (status) => (status === t('HeuristicsReport.status.submitted') ? 'success' : 'warning');
const getStatusIcon = (status) => (status === t('HeuristicsReport.status.submitted') ? 'mdi-check-circle' : 'mdi-progress-clock');

onMounted(async () => {
  const timeout = setTimeout(() => (loading.value = false), 10000);
  try {
    await store.dispatch('getCurrentTestAnswerDoc');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    clearTimeout(timeout);
  }
});
</script>

<style scoped>
.report-card {
  border-radius: 16px !important;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.progress-section {
  min-width: 120px;
}

.v-list-item {
  border-radius: 0 !important;
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.table-header {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.table-heading-text {
  color: #1F2937 !important;
  font-weight: 700 !important;
}

.v-text-field :deep(.v-field__input) {
  min-height: 40px !important;
}

.v-select :deep(.v-field__input) {
  min-height: 40px !important;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>