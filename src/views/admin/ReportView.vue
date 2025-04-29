<template>
  <div>
    <Snackbar />

    <!-- Delete Alert Dialog -->
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
      <div class="white-text mt-3">
        {{ $t('HeuristicsReport.messages.reports_loading') }}
      </div>
    </v-overlay>

    <Intro
      v-if="reports.length == 0 && !loading"
      @go-to-coops="goToCoops"
    />
    <ShowInfo
      v-else
      :title="$t('HeuristicsReport.titles.reports')"
    >
      <template #top>
        <v-row
          justify="end"
          dense
          class="mr-3"
        >
          <p class="subtitleView">
            {{ $t('HeuristicsReport.titles.last_updated') }}:
            {{ new Date().toLocaleString('en') }}
          </p>
        </v-row>
      </template>

      <template #content>
        <div class="ma-0 pa-0">
          <v-data-table
            style="background: #f5f7ff"
            :headers="headers"
            :items="reports"
            :items-per-page="10"
            height="420px"
            dense
          >
            <template #item.more="{ item }">
              <v-menu :offset="[0, 4]">
                <template #activator="{ props }">
                  <v-btn
                    icon
                    v-bind="props"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list v-if="test.testAdmin.email == user.email">
                  <v-list-item @click="dialog = true; report = item">
                    <v-list-item-title>
                      {{ $t('HeuristicsReport.messages.remove_report') }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>

            <template #item.userDocId="{ index }">
              <!-- <div>{{ getCooperatorEmail(item.userDocId) }}</div> -->
              {{ `Ev${index + 1}` }}
            </template>
            <template #item.progress="{ item }">
              <div>{{ item.progress }}</div>
            </template>
            <template #item.submitted="{ item }">
              <div>{{ item.submitted }}</div>
            </template>
            <template #item.lastUpdate="{ item }">
              <div>{{ formatDate(item.lastUpdate) }}</div>
            </template>
          </v-data-table>
        </div>
      </template>
    </ShowInfo>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from "vue-toastification"
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/firebase';
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import Intro from '@/components/molecules/IntroReports.vue';
import Snackbar from '@/components/atoms/Snackbar.vue';

const store = useStore();
const { t } = useI18n();
const toast = useToast()

const props = defineProps({
  id: { type: String, default: '' },
});

const emit = defineEmits(['goToCoops']);

const loading = ref(true);
const dialog = ref(false);
const loadingBtn = ref(false);
const report = ref(null);

const headers = computed(() => [
  {
    text: t('HeuristicsReport.headers.evaluator'),
    value: 'userDocId',
  },
  {
    text: t('HeuristicsReport.headers.last_update'),
    value: 'lastUpdate',
  },
  {
    text: t('HeuristicsReport.headers.progress'),
    value: 'progress',
    justify: 'center',
  },
  {
    text: t('HeuristicsReport.headers.status'),
    value: 'submitted',
  },
  {
    text: t('HeuristicsReport.headers.more'),
    value: 'more',
    justify: 'end',
  },
]);

const checkIfIsSubmitted = (status) => {
  return status
    ? t('HeuristicsReport.status.submitted')
    : t('HeuristicsReport.status.in_progress');
};

const reports = computed(() => {
  const testAnswerDocument = store.getters.testAnswerDocument;

  if (!testAnswerDocument) {
    return [];
  }

  const type = testAnswerDocument.type;
  const rawReports =
    type === 'User'
      ? testAnswerDocument.taskAnswers || {}
      : testAnswerDocument.heuristicAnswers || {};

  const processedReports = [];

  for (const userId in rawReports) {
    const report = rawReports[userId];
    const processedReport = {
      userDocId: report.userDocId,
      total: report.total,
      submitted: checkIfIsSubmitted(report.submitted),
      progress: parseFloat(report.progress).toFixed(2) + '%',
      lastUpdate: report.lastUpdate,
    };

    processedReports.push(processedReport);
  }

  return processedReports;
});

const user = computed(() => store.getters.user);
const test = computed(() => store.getters.test);
const answers = computed(() => store.getters.answers || {});
const dialogText = computed(() =>
  t('HeuristicsReport.messages.sure_to_delete', {
    user: report.value !== null ? report.value.email : '',
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
  const userToRemoveId = report.userDocId;
  let testType = test.value.testType;
  const testId = test.value.id;

  if (testType === 'HEURISTIC') testType = 'heuristicAnswers';
  if (testType === 'User') testType = 'taskAnswers';

  try {
    const userDocRef = doc(db, 'users', userToRemoveId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const updateObject = {};
      updateObject[`myAnswers.${testId}`] = deleteField();
      await updateDoc(userDocRef, updateObject);
    }

    const answerDocRef = doc(db, 'answers', answerId);
    const answerDoc = await getDoc(answerDocRef);

    if (answerDoc.exists()) {
      const updateObject = {};
      updateObject[`${testType}.${userToRemoveId}`] = deleteField();
      await updateDoc(answerDocRef, updateObject);
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

const formatDate = (timestamp) => {
  const currentDate = new Date();
  const startDate = new Date(timestamp);

  const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
  const monthDiff = currentDate.getMonth() - startDate.getMonth();
  const dayDiff = currentDate.getDate() - startDate.getDate();
  const hourDiff = currentDate.getHours() - startDate.getHours();
  const minuteDiff = currentDate.getMinutes() - startDate.getMinutes();

  if (yearDiff > 0) {
    return formatTimeAgo(yearDiff, 'years');
  } else if (monthDiff > 0) {
    return formatTimeAgo(monthDiff, 'months');
  } else if (dayDiff > 0) {
    return formatTimeAgo(dayDiff, 'days');
  } else if (hourDiff > 0) {
    return formatTimeAgo(hourDiff, 'hours');
  } else if (minuteDiff > 0) {
    return formatTimeAgo(minuteDiff, 'minutes');
  } else {
    return t('common.timeAgo.now');
  }
};

const formatTimeAgo = (timeDiff, unit) => {
  const translationKey = `common.timeAgo.${unit}`;
  const translatedText = t(translationKey, { count: timeDiff });
  return translatedText;
};

const goToCoops = () => {
  emit('goToCoops');
};

const getCooperatorEmail = (userDocId) => {
  if (userDocId == user.value.id) return 'You';
  let cooperatorEmail = null;
  if (test.value.cooperators && Array.isArray(test.value.cooperators)) {
    for (const element of test.value.cooperators) {
      if (element && element.email && element.userDocId === userDocId) {
        cooperatorEmail = element.email;
      }
    }
  }
  return cooperatorEmail;
};

onMounted(async () => {
  const timeout = setTimeout(() => {
    loading.value = false;
  }, 10000);
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
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
</style>