<template>
  <v-card class="fill-height">
    <v-container fluid class="pa-0 fill-height" style="overflow-y: auto;">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-h3 font-weight-bold text-primary">
          TAM Analytics
        </h1>
        <p class="text-h6 text-grey-darken-1">
          Technology Acceptance Model insights across all participants
        </p>
      </div>

      <!-- Version Selection -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-btn-toggle
            v-model="selectedVersion"
            mandatory
            color="primary"
            divided
            class="w-100"
          >
            <v-btn
              v-for="version in availableVersions"
              :key="version"
              :value="version"
              class="flex-grow-1"
            >
              {{ version.toUpperCase() }}
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

      <!-- Overview Cards -->
      <v-row class="mb-0">
        <v-col cols="12" md="4" class="d-flex">
          <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px; width: 100%;">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Average Acceptance Score
                </div>
                <div class="text-h2 font-weight-bold text-success mb-1">
                  {{ analytics.averageOverallScore }}
                </div>
                <div class="text-caption text-grey">
                  out of 100
                </div>
              </div>
              <div class="pa-3" style="background: #e8f5e9; border-radius: 8px;">
                <v-icon size="24" color="success">
                  mdi-chart-line
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4" class="d-flex">
          <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px; width: 100%;">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Total Respondents
                </div>
                <div class="text-h2 font-weight-bold text-info mb-1">
                  {{ analytics.totalRespondents }}
                </div>
                <div class="text-caption text-grey">
                  participants assessed
                </div>
              </div>
              <div class="pa-3" style="background: #e3f2fd; border-radius: 8px;">
                <v-icon size="24" color="info">
                  mdi-account-multiple
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4" class="d-flex">
          <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px; width: 100%;">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Acceptance Level
                </div>
                <div class="text-h5 font-weight-bold" :style="{ color: getAcceptanceColor(analytics.averageOverallScore) }">
                  {{ getAcceptanceLevel(analytics.averageOverallScore) }}
                </div>
                <div class="text-caption text-grey">
                  overall sentiment
                </div>
              </div>
              <div class="pa-3" style="background: #f3e5f5; border-radius: 8px;">
                <v-icon size="24" color="primary">
                  mdi-gauge
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dimension Breakdown Cards -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2" style="border-radius: 12px;">
            <v-card-title class="text-h5 pa-5">
              Dimension Scores
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <v-col
                  v-for="dimension in getActiveDimensions(selectedVersion)"
                  :key="dimension.key"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <div class="dimension-card pa-4" :style="{ borderLeft: `4px solid ${dimension.color}` }">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                      {{ dimension.label }}
                    </div>
                    <div class="d-flex align-center mb-3">
                      <div class="text-h3 font-weight-bold" :style="{ color: dimension.color }">
                        {{ analytics.dimensionAverages[dimension.key] }}
                      </div>
                      <div class="text-caption text-grey ml-2">/ 100</div>
                    </div>
                    <v-progress-linear
                      :model-value="analytics.dimensionAverages[dimension.key]"
                      :color="dimension.color"
                      height="6"
                      rounded
                    />
                    <div class="text-caption text-grey mt-2">
                      {{ getInterpretation(analytics.dimensionAverages[dimension.key]) }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Respondent Data Table -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2" style="border-radius: 12px;">
            <v-card-title class="text-h5 pa-5">
              Respondent Details
            </v-card-title>
            <v-data-table
              :headers="getTableHeaders(selectedVersion)"
              :items="analytics.responses"
              items-per-page="10"
              class="elevation-0"
              style="background: white;"
              @click:row="(_, { item }) => openDetails(item)"
            >
              <template #item.overallScore="{ item }">
                <v-chip
                  :color="getScoreColor(item.overallScore)"
                  text-color="white"
                  size="small"
                >
                  {{ item.overallScore }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <v-icon
                  size="small"
                  color="primary"
                  @click.stop="openDetails(item)"
                >
                  mdi-eye
                </v-icon>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Details Dialog -->
      <v-dialog
        v-model="detailsModal"
        max-width="600px"
      >
        <v-card v-if="selectedResponse">
          <v-card-title class="text-h5">
            Respondent Details: {{ selectedResponse.name || 'Anonymous' }}
          </v-card-title>
          <v-card-text>
            <v-divider class="my-4" />
            <div class="text-h6 font-weight-bold mb-4">
              Overall Score: <span :style="{ color: getScoreColor(selectedResponse.overallScore) }">
                {{ selectedResponse.overallScore }}
              </span>
            </div>

            <div class="text-subtitle-1 font-weight-bold mb-4">
              Dimension Breakdown:
            </div>

            <v-row>
              <v-col
                v-for="dimension in getActiveDimensions(selectedVersion)"
                :key="dimension.key"
                cols="12"
              >
                <div class="dimension-detail pa-3 rounded-lg">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="text-subtitle-2 font-weight-bold">
                      {{ dimension.label }}
                    </div>
                    <v-chip
                      small
                      :color="dimension.color"
                      text-color="white"
                      label
                    >
                      {{ selectedResponse.dimensionScores?.[dimension.key] || 'N/A' }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-grey mb-2">
                    {{ dimension.description }}
                  </div>
                  <v-progress-linear
                    :model-value="selectedResponse.dimensionScores?.[dimension.key] || 0"
                    :color="dimension.color"
                    height="8"
                    rounded
                  />
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              variant="text"
              @click="detailsModal = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-card>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { calculateTAMScore, getTAMAcceptanceLevel, getAcceptanceColor, formatDimensionName, calculateDimensionScore } from '../../utils/tamCalculator'

const store = useStore()

// TAM Dimensions Data
const TAM_DIMENSIONS = {
  tam1: [
    { key: 'tam1_pu', label: 'Perceived Usefulness', description: 'The system improves job performance', color: '#2196F3' },
    { key: 'tam1_eu', label: 'Perceived Ease of Use', description: 'The system is easy to interact with', color: '#4CAF50' }
  ],
  tam2: [
    { key: 'tam1_pu', label: 'Perceived Usefulness', description: 'The system improves job performance', color: '#2196F3' },
    { key: 'tam1_eu', label: 'Perceived Ease of Use', description: 'The system is easy to interact with', color: '#4CAF50' },
    { key: 'tam2_sn', label: 'Subjective Norm', description: 'Others influence usage', color: '#FF9800' },
    { key: 'tam2_img', label: 'Image', description: 'Status and prestige impact', color: '#E91E63' },
    { key: 'tam2_jr', label: 'Job Relevance', description: 'Relevance to job tasks', color: '#9C27B0' },
    { key: 'tam2_oq', label: 'Output Quality', description: 'Quality of results', color: '#00BCD4' },
    { key: 'tam2_rd', label: 'Result Demonstrability', description: 'Observable results', color: '#8BC34A' }
  ],
  tam3: [
    { key: 'tam1_pu', label: 'Perceived Usefulness', description: 'The system improves job performance', color: '#2196F3' },
    { key: 'tam1_eu', label: 'Perceived Ease of Use', description: 'The system is easy to interact with', color: '#4CAF50' },
    { key: 'tam2_sn', label: 'Subjective Norm', description: 'Others influence usage', color: '#FF9800' },
    { key: 'tam2_img', label: 'Image', description: 'Status and prestige impact', color: '#E91E63' },
    { key: 'tam2_jr', label: 'Job Relevance', description: 'Relevance to job tasks', color: '#9C27B0' },
    { key: 'tam2_oq', label: 'Output Quality', description: 'Quality of results', color: '#00BCD4' },
    { key: 'tam2_rd', label: 'Result Demonstrability', description: 'Observable results', color: '#8BC34A' },
    { key: 'tam3_cse', label: 'Computer Self-Efficacy', description: 'Confidence in using systems', color: '#03A9F4' },
    { key: 'tam3_ec', label: 'External Control', description: 'External support availability', color: '#009688' },
    { key: 'tam3_anx', label: 'Anxiety', description: 'Apprehension about use', color: '#F44336' },
    { key: 'tam3_pf', label: 'Playfulness', description: 'Enjoyment of system use', color: '#FF5722' },
    { key: 'tam3_enj', label: 'Enjoyment', description: 'Intrinsic motivation', color: '#FFEB3B' },
    { key: 'tam3_ou', label: 'Objective Usability', description: 'Actual system ease of use', color: '#4CAF50' }
  ]
}

const analytics = ref({
  averageOverallScore: 0,
  totalRespondents: 0,
  dimensionAverages: {},
  responses: []
})

const selectedVersion = ref('tam1')

const availableVersions = computed(() => {
  console.log('Computing availableVersions...');
  console.log('tamData items:', tamData.value.length);
  
  // Get unique task types that have actual TAM answers
  const versionsWithData = new Set();
  
  tamData.value.forEach((item, idx) => {
    console.log(`Item ${idx}:`, { taskType: item.taskType, hasAnswers: item.tamAnswers });
    
    if (item.taskType && item.tamAnswers) {
      // Check if this task has any actual answered questions
      const hasAnswers = Object.entries(item.tamAnswers).some(([key, dimension]) => {
        // Skip metadata
        if (key === 'tamVersion') return false;
        // Check if dimension array has actual answers (not all undefined)
        const hasValidAnswer = Array.isArray(dimension) && dimension.some(answer => 
          answer !== undefined && answer !== null && answer !== ''
        );
        return hasValidAnswer;
      });
      
      if (hasAnswers) {
        // Convert 'tam-1' to 'tam1'
        const versionKey = item.taskType.replace('-', '');
        console.log(`Adding version: ${versionKey} for taskType: ${item.taskType}`);
        versionsWithData.add(versionKey);
      }
    }
  });
  
  const result = Array.from(versionsWithData).sort();
  console.log('Final availableVersions:', result);
  
  // If no data found, return empty array so no tabs show until data loads
  return result.length > 0 ? result : [];
})
const detailsModal = ref(false)
const selectedResponse = ref(null)

const test = computed(() => store.getters.test.testStructure)
const testAnswerDocument = computed(() => store.getters.visibleUserAnswers || {})

// Debug: Log all answer items to help diagnose why not all are loading
const totalAnswerCount = computed(() => {
  console.log('All answer items in testAnswerDocument:', Object.keys(testAnswerDocument.value).length);
  console.log('testAnswerDocument keys:', Object.keys(testAnswerDocument.value));
  return Object.keys(testAnswerDocument.value).length;
})

const tamData = computed(() => {
  const allData = [];
  
  Object.entries(testAnswerDocument.value || {}).forEach(([userId, answerItem]) => {
    if (!answerItem || !answerItem.tasks) return;
    
    // Handle both array and object formats for tasks
    const taskEntries = Array.isArray(answerItem.tasks) 
      ? answerItem.tasks.entries() 
      : Object.entries(answerItem.tasks);
    
    taskEntries.forEach(([taskIndexOrId, task]) => {
      if (!task) return;
      
      // Get the actual task index/id
      const taskId = task.taskId !== undefined ? task.taskId : taskIndexOrId;
      
      // Get task type from test structure
      const taskType = test.value?.userTasks?.[taskId]?.taskType;
      
      // Check if this is a TAM task with answers
      if (['tam-1', 'tam-2', 'tam-3'].includes(taskType) && 
          task.tamAnswers && 
          typeof task.tamAnswers === 'object' && 
          Object.keys(task.tamAnswers).length > 0) {
        
        allData.push({
          ...task,
          userId,
          taskId,
          taskType,
          fullName: answerItem.fullName || 'Anonymous'
        });
      }
    });
  });
  
  return allData;
})

function getActiveDimensions(version) {
  // Handle both 'tam1' and 'tam-1' formats
  let versionKey = version;
  if (version.includes('-')) {
    versionKey = version.replace('-', '');
  }
  
  return TAM_DIMENSIONS[versionKey] || []
}

function getTableHeaders(version) {
  const activeDimensions = getActiveDimensions(version)
  const dimensionHeaders = activeDimensions.map(dim => ({
    title: dim.label.split(' ')[0],
    key: dim.key,
    sortable: true
  }))

  return [
    { title: 'Participant', key: 'name', sortable: true },
    ...dimensionHeaders,
    { title: 'Overall', key: 'overallScore', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false }
  ]
}

function getAcceptanceLevel(score) {
  if (score >= 80) return 'Very High'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Moderate'
  if (score >= 20) return 'Low'
  return 'Very Low'
}

// Note: getAcceptanceColor is imported from tamCalculator

function getScoreColor(score) {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

function getInterpretation(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Moderate'
  if (score >= 20) return 'Poor'
  return 'Very Poor'
}

function openDetails(response) {
  selectedResponse.value = response
  detailsModal.value = true
}

function calculateAnalytics() {
  // Filter data based on selected version (tam1, tam2, tam3)
  const selectedVersionValue = selectedVersion.value.toLowerCase(); // 'tam1', 'tam2', 'tam3'
  const selectedVersionFull = selectedVersion.value.includes('-') ? selectedVersion.value : `tam-${selectedVersion.value.slice(-1)}`; // 'tam-1', 'tam-2', 'tam-3'
  
  const filteredData = tamData.value.filter(item => {
    return item.taskType === selectedVersionFull;
  });

  if (filteredData.length === 0) {
    analytics.value = {
      averageOverallScore: 0,
      totalRespondents: 0,
      dimensionAverages: {},
      responses: []
    }
    return
  }

  const activeDimensions = getActiveDimensions(selectedVersion.value)
  const responses = []
  
  // Calculate scores for each response
  filteredData.forEach(item => {
    const tamScore = calculateTAMScore(item.tamAnswers, selectedVersionFull)
    
    const dimensionScores = {}
    const dimensionMap = {
      'tam1_pu': 'perceivedUsefulness',
      'tam1_eu': 'perceivedEaseOfUse',
      'tam2_sn': 'subjectiveNorm',
      'tam2_img': 'image',
      'tam2_jr': 'jobRelevance',
      'tam2_oq': 'outputQuality',
      'tam2_rd': 'resultDemonstrability',
      'tam3_cse': 'computerSelfEfficacy',
      'tam3_ec': 'perceptionsOfExternalControl',
      'tam3_anx': 'computerAnxiety',
      'tam3_pf': 'computerPlayfulness',
      'tam3_enj': 'perceivedEnjoyment',
      'tam3_ou': 'objectiveUsability'
    }
    
    activeDimensions.forEach(dim => {
      const dimensionKey = dimensionMap[dim.key]
      dimensionScores[dim.key] = tamScore.dimensions[dimensionKey]?.score || 0
    })
    
    responses.push({
      ...item,
      dimensionScores,
      overallScore: tamScore.overallScore
    })
  })

  // Calculate dimension averages
  const dimensionAverages = {}
  activeDimensions.forEach(dim => {
    const values = responses
      .map(r => r.dimensionScores[dim.key])
      .filter(v => typeof v === 'number' && !isNaN(v))
    dimensionAverages[dim.key] = values.length > 0
      ? Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10
      : 0
  })

  // Calculate average overall score
  const overallScores = responses.map(r => r.overallScore)
  const averageOverallScore = overallScores.length > 0
    ? Math.round((overallScores.reduce((sum, val) => sum + val, 0) / overallScores.length) * 10) / 10
    : 0

  analytics.value = {
    averageOverallScore,
    totalRespondents: filteredData.length,
    dimensionAverages,
    responses
  }
}

watchEffect(() => {
  // Ensure selectedVersion is in availableVersions
  const versions = availableVersions.value;
  console.log('Current selectedVersion:', selectedVersion.value, 'Available versions:', versions);
  
  if (!versions.includes(selectedVersion.value)) {
    selectedVersion.value = versions[0] || 'tam1';
    console.log('Updated selectedVersion to:', selectedVersion.value);
  }
  calculateAnalytics()
})
</script>

<style scoped>
.dimension-card {
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.dimension-card:hover {
  background: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dimension-detail {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.dimension-detail:hover {
  background: #f0f0f0;
  border-color: #d0d0d0;
}

.v-data-table {
  cursor: pointer;
}

.v-data-table :deep(tbody tr:hover) {
  background-color: rgba(33, 150, 243, 0.05) !important;
}
</style>
