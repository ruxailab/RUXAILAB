<template>
  <v-card elevation="1" elevation-hover="2" rounded="lg" class="active-studies-card">
    <!-- Card Header with better mobile spacing -->
    <v-card-title class="card-header d-flex align-center justify-space-between py-3 py-md-4 px-3 px-md-4">
      <div class="d-flex align-center header-content">
        <v-icon icon="mdi-flask-outline" class="me-2 icon-size" color="primary" />
        <span class="card-title-text">Active Studies Overview</span>
      </div>
      <v-btn 
        variant="text" 
        size="small" 
        color="primary" 
        @click="viewAllStudies"
        class="view-all-btn"
      >
        View All
      </v-btn>
    </v-card-title>

    <!-- Card Content with better top padding on mobile -->
    <v-card-text class="card-content pa-3 pa-md-4">
      <v-row v-if="loading">
        <v-col v-for="n in 4" :key="n" cols="12" sm="6" lg="6" class="mb-3 mb-sm-0">
          <v-skeleton-loader
            type="card"
            class="study-skeleton"
            elevation="1"
            rounded="lg"
            height="160"
          />
        </v-col>
      </v-row>
      
      <div v-else class="studies-container">
        <!-- Empty State with better spacing from header -->
        <div v-if="!loading && studies.length === 0" class="empty-state">
          <v-icon icon="mdi-flask-empty" size="48" color="grey-lighten-1" class="mb-3 empty-icon" />
          <p class="empty-title text-body-1 text-grey-darken-1 mb-2">No active studies</p>
          <p class="empty-subtitle text-caption text-grey">Create your first study to get started</p>
        </div>
        
        <!-- Studies Grid -->
        <v-row v-else>
          <v-col 
            v-for="study in studies.filter(s => s)" 
            :key="study.id" 
            cols="12" 
            sm="6" 
            md="6" 
            lg="6"
            class="mb-3"
          >
            <v-card 
              variant="outlined" 
              rounded="lg" 
              class="study-card" 
              @click="goToStudy(study)" 
              hover
            >
              <v-card-text class="pa-3 pa-md-4">
                <!-- Status & Icon Row -->
                <div class="d-flex align-center justify-space-between mb-2 mb-md-3">
                  <v-chip
                    :color="getStatusColor(study.status)"
                    variant="tonal" 
                    size="small"
                    class="status-chip"
                  >
                    {{ formatStatus(study.status) }}
                  </v-chip>
                  <v-icon :icon="getMethodIcon(study)" size="18" class="method-icon" color="primary" />
                </div>

                <!-- Study Title -->
                <h4 class="study-title text-subtitle-2 text-md-subtitle-1 font-weight-bold mb-1 mb-md-2">
                  {{ study.title }}
                </h4>
                
                <!-- Description -->
                <p class="study-description text-caption text-md-body-2 text-medium-emphasis mb-2 mb-md-3">
                  {{ truncateDescription(study.description) }}
                </p>

                <!-- Progress -->
                <div class="mb-2 mb-md-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption font-weight-medium">Progress</span>
                    <span class="text-caption font-weight-medium">{{ study.progress }}%</span>
                  </div>
                  <v-progress-linear 
                    :model-value="study.progress"
                    :color="study.status === 'active' ? 'success' : 'primary'" 
                    height="4" 
                    rounded 
                    class="progress-bar"
                  />
                </div>

                <!-- Metrics -->
                <div class="d-flex justify-space-between align-center text-caption">
                  <div class="d-flex align-center metric-item">
                    <v-icon icon="mdi-account-group" size="14" class="me-1 metric-icon" color="info" />
                    <span class="metric-text">{{ study.participants }} participants</span>
                  </div>
                  <div v-if="study.daysLeft !== null" class="d-flex align-center metric-item">
                    <v-icon icon="mdi-calendar-clock" size="14" class="me-1 metric-icon" color="warning" />
                    <span class="metric-text">{{ formatDaysLeft(study.daysLeft) }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import AnswerController from '@/shared/controllers/AnswerController';
import { getMethodIcon, getMethodManagerView, STUDY_TYPES } from '@/shared/constants/methodDefinitions';
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router';

const props = defineProps({
  studies: {
    type: Array,
    default: () => []
  }
})

const router = useRouter();
const answerController = new AnswerController()

const loading = ref(false);
const studiesWithAnswers = ref([]);

const studies = computed(() => {
  return props.studies.length > 0  ? studiesWithAnswers.value : loading  ? [] : defaultStudies
})

const lastFourStudies = computed(() => {
  if (!props.studies) return [];
  return [...props.studies].sort(
    (a, b) => (b.creationDate || 0) - (a.creationDate || 0)
  ).slice(0, 4);
});

async function loadAnswers() {
  if (!lastFourStudies.value.length) {
    studiesWithAnswers.value = [];
    return;
  }

  loading.value = true;
  const last4 = []
  try {
    for (const study in lastFourStudies.value) {    
      const testDoc = lastFourStudies.value[study]
      const answerDoc = await answerController.getAnswerById(testDoc.answersDocId);
      if (answerDoc.type === STUDY_TYPES.USER) {
        last4.push({
          ...testDoc,
          answers: Object.values({ ...answerDoc.taskAnswers })
        })
      } else {
        last4.push({
          ...testDoc,
          answers: Object.values({ ...answerDoc.heuristicAnswers })
        })
      }
    }
    finalFour(last4)
  } catch (e) {
    console.error('Error loading answers', e);
    studiesWithAnswers.value = [];
  } finally {
    loading.value = false;
  }
}

const calculateProgress = (answers) => {
  if (!answers || answers.length === 0) return 0;
  const sum = answers.reduce((acc, val) => acc + val.progress, 0);
  return sum / answers.length;
}

const daysLeft = (date) => {
  if(!date) return 0
  const futureDate = new Date(date);
  const today = new Date();

  const differenceInTime = futureDate.getTime() - today.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);

  return Math.floor(differenceInDays);
}

const finalFour = (studyArr) => {
  if (!studyArr) {
    studiesWithAnswers.value = [];
    return
  }
  studiesWithAnswers.value = studyArr.map(study => ({
    id: study.id,
    title: study.testTitle,
    description: study.testDescription,
    status: study.status,
    progress: calculateProgress(study.answers),
    participants: study.answers?.length || 0,
    daysLeft: study.endDate ? daysLeft(study.endDate) : null,
    typeIcon: 'mdi-sort-variant',
    testType: study.testType,
    subType: study.subType,
  }))
  .filter((study, index, self) =>
    index === self.findIndex(m => m.id === study.id)
  );
}

const goToStudy = async (study) => {
  const methodView = getMethodManagerView(study.testType, study.subType)
  router.push({ name: methodView, params: { id: study.id } })
}

const viewAllStudies = () => {
  globalThis.dispatchEvent(new CustomEvent('change-section', { detail: 'studies' }))
}

// Helper functions for responsiveness
const getStatusColor = (status) => {
  switch(status) {
    case 'active': return 'success';
    case 'finished': return 'warning';
    case 'recruiting': return 'info';
    case 'paused': return 'grey';
    default: return 'info';
  }
}

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const truncateDescription = (description) => {
  if (!description) return '';
  const maxLength = window.innerWidth < 600 ? 60 : 100;
  return description.length > maxLength 
    ? description.substring(0, maxLength) + '...' 
    : description;
}

const formatDaysLeft = (days) => {
  if (days === 0) return 'Ends today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

// Default studies if none provided
const defaultStudies = [
  {
    id: 1,
    title: 'Mobile Banking UX Study',
    description: 'Evaluating user experience and accessibility of mobile banking features',
    status: 'active',
    progress: 75,
    participants: 24,
    daysLeft: 5,
    typeIcon: 'mdi-cellphone'
  },
  {
    id: 2,
    title: 'E-commerce Card Sorting',
    description: 'Understanding user mental models for product categorization',
    status: 'recruiting',
    progress: 45,
    participants: 18,
    daysLeft: 12,
    typeIcon: 'mdi-sort-variant'
  },
  {
    id: 3,
    title: 'Voice Interface Testing',
    description: 'Usability testing for voice-controlled smart home devices',
    status: 'active',
    progress: 90,
    participants: 32,
    daysLeft: 2,
    typeIcon: 'mdi-microphone'
  },
  {
    id: 4,
    title: 'Accessibility Audit',
    description: 'Comprehensive accessibility evaluation of web application',
    status: 'paused',
    progress: 30,
    participants: 12,
    daysLeft: 20,
    typeIcon: 'mdi-wheelchair-accessibility'
  }
]

watch(
  () => props.studies,
  () => {
    loadAnswers();
  },
  { immediate: true }
);

// Re-truncate descriptions on window resize
import { onMounted, onUnmounted } from 'vue';

const handleResize = () => {
  // Force re-render for responsive truncation
  studiesWithAnswers.value = [...studiesWithAnswers.value];
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.active-studies-card {
  min-height: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Card Header - Fixed spacing issue */
.card-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.1);
  min-height: 56px;
}

.header-content {
  flex: 1;
  min-height: 32px;
  overflow: hidden;
}

.card-title-text {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-all-btn {
  min-width: auto;
  padding: 4px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-content {
  padding-top: 16px !important;
}

.studies-container {
  flex: 1;
  min-height: 200px;
}

.study-card {
  height: 100%;
  min-height: 140px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.study-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.study-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.study-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.status-chip {
  font-size: 0.7rem;
  height: 22px;
}

.method-icon {
  flex-shrink: 0;
}

.progress-bar {
  min-height: 4px;
}

.metric-item {
  flex-shrink: 0;
}

.metric-text {
  font-size: 0.75rem;
  white-space: nowrap;
}

.metric-icon {
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  height: 100%;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.empty-subtitle {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  max-width: 250px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .card-header {
    min-height: 48px;
    padding: 12px 16px !important;
    margin-bottom: 8px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .header-content {
    min-width: 0;
  }
  
  .card-content {
    padding-top: 12px !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
    padding-bottom: 16px !important;
  }
  
  .card-title-text {
    font-size: 0.875rem;
    line-height: 1.3;
  }
  
  .icon-size {
    font-size: 18px;
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .view-all-btn {
    font-size: 0.75rem;
    padding: 4px 10px;
    height: 28px;
    margin-left: 8px;
    min-width: 70px;
  }
  
  .study-card {
    min-height: 120px;
    margin-top: 8px;
  }
  
  .study-title {
    -webkit-line-clamp: 1;
    font-size: 0.875rem;
    margin-bottom: 6px;
  }
  
  .study-description {
    -webkit-line-clamp: 2;
    font-size: 0.75rem;
    margin-bottom: 12px;
  }
  
  .status-chip {
    font-size: 0.65rem;
    height: 20px;
    padding: 0 8px;
  }
  
  .metric-text {
    font-size: 0.7rem;
  }
  
  .method-icon {
    font-size: 16px;
  }
  
  .empty-state {
    min-height: 200px;
    padding: 30px 16px;
  }
  
  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }
  
  .empty-title {
    font-size: 1rem;
  }
  
  .empty-subtitle {
    font-size: 0.8rem;
    max-width: 220px;
  }
}

/* Very small devices (below 380px) - FIX FOR THE VIEW ALL BUTTON CUT OFF */
@media (max-width: 380px) {
  .card-header {
    padding: 10px 12px !important;
    min-height: auto;
    align-items: flex-start;
    gap: 6px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    margin-bottom: 4px;
  }
  
  .card-title-text {
    font-size: 0.75rem;
    line-height: 1.2;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    display: block;
    width: 100%;
    margin-bottom: 2px;
  }
  
  .icon-size {
    font-size: 16px;
    margin-right: 6px;
    margin-bottom: 2px;
  }
  
  .view-all-btn {
    font-size: 0.7rem;
    padding: 3px 6px;
    height: 24px;
    min-width: 60px;
    margin-left: 0;
    align-self: flex-end;
    margin-top: -4px;
  }
  
  .empty-state {
    padding: 20px 12px;
    min-height: 180px;
  }
  
  .empty-title {
    font-size: 0.9rem;
  }
  
  .empty-subtitle {
    font-size: 0.75rem;
    max-width: 200px;
  }
}

/* Extra small devices (320px - 380px) */
@media (min-width: 320px) and (max-width: 380px) {
  .card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-content {
    flex-direction: row;
    align-items: center;
    margin-bottom: 0;
  }
  
  .card-title-text {
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100vw - 120px);
  }
  
  .view-all-btn {
    margin-top: 0;
    min-width: 65px;
  }
}

/* Extreme small devices (below 320px) */
@media (max-width: 320px) {
  .card-header {
    flex-wrap: nowrap;
  }
  
  .card-title-text {
    font-size: 0.7rem;
    max-width: calc(100vw - 100px);
  }
  
  .view-all-btn {
    min-width: 55px;
    font-size: 0.65rem;
    padding: 2px 4px;
    height: 22px;
  }
  
  .icon-size {
    font-size: 14px;
    margin-right: 4px;
  }
}

/* Tablet */
@media (min-width: 601px) and (max-width: 960px) {
  .card-header {
    min-height: 52px;
  }
  
  .study-card {
    min-height: 160px;
  }
  
  .card-title-text {
    font-size: 1.125rem;
  }
  
  .icon-size {
    font-size: 22px;
  }
  
  .study-title {
    font-size: 1rem;
  }
  
  .study-description {
    font-size: 0.875rem;
  }
  
  .empty-state {
    min-height: 300px;
    padding: 50px 20px;
  }
}

/* Desktop */
@media (min-width: 961px) {
  .active-studies-card {
    min-height: 480px;
  }
  
  .card-header {
    min-height: 60px;
  }
  
  .study-card {
    min-height: 180px;
  }
  
  .card-title-text {
    font-size: 1.25rem;
  }
  
  .empty-state {
    min-height: 350px;
  }
}

/* Ensure touch-friendly targets */
@media (max-width: 960px) {
  .study-card {
    padding: 2px;
  }
  
  .status-chip {
    min-height: 24px;
    min-width: 60px;
  }
  
  .view-all-btn {
    min-height: 32px;
    min-width: 70px;
  }
}

/* Study skeleton loader */
.study-skeleton {
  width: 100%;
  min-height: 140px;
  margin-top: 8px;
}
</style>