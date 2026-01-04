<template>
  <v-card class="fill-height">
    <v-container fluid class="pa-0 fill-height" style="overflow-y: auto;">
      <!-- Header Section with Version -->
      <v-row class="mb-8 align-center">
        <v-col cols="12" md="6">
          <h1 class="text-h3 font-weight-bold text-primary mb-2">
            TAM Analytics
          </h1>
          <p class="text-h6 text-grey-darken-1 ma-0">
            Technology Acceptance Model insights across all participants
          </p>
        </v-col>
      </v-row>

      <!-- Overview Cards - 4 Column Grid -->
      <v-row class="mb-8">
        <!-- Average Acceptance Score -->
        <v-col cols="12" sm="6" md="3" class="d-flex">
          <v-card class="pa-6 text-center flex-grow-1" elevation="2" style="border-radius: 12px;">
            <div class="mb-2">
              <div class="text-caption text-grey-darken-1 mb-2">
                Average Acceptance
              </div>
              <div class="text-h2 font-weight-bold text-success">
                {{ (analytics.averageOverallScore / 100 * 7).toFixed(1) }}
              </div>
              <div class="text-caption text-grey">
                out of 7.0
              </div>
            </div>
            <div class="d-flex justify-center">
              <v-icon size="32" color="success">
                mdi-chart-line
              </v-icon>
            </div>
          </v-card>
        </v-col>

        <!-- Total Respondents -->
        <v-col cols="12" sm="6" md="3" class="d-flex">
          <v-card class="pa-6 text-center flex-grow-1" elevation="2" style="border-radius: 12px;">
            <div class="mb-2">
              <div class="text-caption text-grey-darken-1 mb-2">
                Total Respondents
              </div>
              <div class="text-h2 font-weight-bold text-info">
                {{ analytics.totalRespondents }}
              </div>
              <div class="text-caption text-grey">
                participants
              </div>
            </div>
            <div class="d-flex justify-center">
              <v-icon size="32" color="info">
                mdi-account-multiple
              </v-icon>
            </div>
          </v-card>
        </v-col>

        <!-- TAM Versions Used -->
        <v-col cols="12" sm="6" md="3" class="d-flex">
          <v-card class="pa-6 text-center flex-grow-1" elevation="2" style="border-radius: 12px;">
            <div class="mb-2">
              <div class="text-caption text-grey-darken-1 mb-2">
                TAM Versions Used
              </div>
              <div class="text-h2 font-weight-bold" style="color: #9c27b0;">
                {{ getUsedVersionsCount() }}
              </div>
              <div class="text-caption text-grey">
                version(s)
              </div>
            </div>
            <div class="d-flex justify-center">
              <v-icon size="32" style="color: #9c27b0;">
                mdi-format-list-checks
              </v-icon>
            </div>
          </v-card>
        </v-col>

        <!-- Highest Construct -->
        <v-col cols="12" sm="6" md="3" class="d-flex">
          <v-card class="pa-6 text-center flex-grow-1" elevation="2" style="border-radius: 12px;">
            <div class="mb-2">
              <div class="text-caption text-grey-darken-1 mb-2">
                Highest Construct
              </div>
              <div class="text-h6 font-weight-bold" style="color: #ff9800;">
                {{ getHighestConstruct() }}
              </div>
              <div class="text-caption text-grey">
                {{ getHighestConstructScore() }} avg
              </div>
            </div>
            <div class="d-flex justify-center">
              <v-icon size="32" style="color: #ff9800;">
                mdi-trending-up
              </v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Core TAM Constructs Comparison Section -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold mb-4">
            Core TAM Constructs Comparison
          </h2>
        </v-col>

        <!-- Scatter Plot & Bar Chart - 2 Columns -->
        <v-col cols="12" lg="6">
          <v-card elevation="2" style="border-radius: 12px; height: 100%;">
            <v-card-title class="text-h6 pa-4">
              Perceived Usefulness vs Ease of Use
            </v-card-title>
            <v-card-text class="pa-4">
              <svg width="100%" height="300" viewBox="0 0 500 300" style="border: 1px solid #e0e0e0; border-radius: 8px;">
                <!-- Grid background -->
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
                  </pattern>
                </defs>
                <rect width="500" height="300" fill="url(#grid)" />
                
                <!-- Y Axis -->
                <line x1="50" y1="20" x2="50" y2="270" stroke="#333" stroke-width="2"/>
                <!-- X Axis -->
                <line x1="50" y1="270" x2="480" y2="270" stroke="#333" stroke-width="2"/>
                
                <!-- Y Axis Labels -->
                <text x="35" y="275" text-anchor="end" font-size="12" fill="#666">0</text>
                <text x="35" y="220" text-anchor="end" font-size="12" fill="#666">25</text>
                <text x="35" y="165" text-anchor="end" font-size="12" fill="#666">50</text>
                <text x="35" y="110" text-anchor="end" font-size="12" fill="#666">75</text>
                <text x="35" y="55" text-anchor="end" font-size="12" fill="#666">100</text>
                
                <!-- X Axis Labels -->
                <text x="55" y="290" font-size="12" fill="#666">0</text>
                <text x="160" y="290" font-size="12" fill="#666">25</text>
                <text x="265" y="290" font-size="12" fill="#666">50</text>
                <text x="370" y="290" font-size="12" fill="#666">75</text>
                <text x="465" y="290" font-size="12" fill="#666">100</text>
                
                <!-- Axis Labels -->
                <text x="250" y="315" text-anchor="middle" font-size="13" fill="#333" font-weight="bold">
                  Perceived Ease of Use
                </text>
                <text x="15" y="150" text-anchor="middle" font-size="13" fill="#333" font-weight="bold" transform="rotate(-90 15 150)">
                  Perceived Usefulness
                </text>
                
                <!-- Data points (scatter plot) -->
                <g>
                  <circle v-for="(point, idx) in scatterPlotData" :key="idx" 
                    :cx="50 + (point.easeOfUse / 100) * 430"
                    :cy="270 - (point.usefulness / 100) * 250"
                    r="5" 
                    :fill="point.color" 
                    opacity="0.7" 
                    style="cursor: pointer; transition: r 0.2s;"
                    @mouseenter="point.hovered = true"
                    @mouseleave="point.hovered = false"
                  />
                </g>
                
                <!-- Tooltip -->
                <g v-for="(point, idx) in scatterPlotData.filter(p => p.hovered)" :key="'tooltip-' + idx">
                  <rect 
                    :x="50 + (point.easeOfUse / 100) * 430 + 10"
                    :y="270 - (point.usefulness / 100) * 250 - 30"
                    width="80" height="30" 
                    fill="white" 
                    stroke="#999" 
                    stroke-width="1" 
                    rx="4"
                  />
                  <text 
                    :x="50 + (point.easeOfUse / 100) * 430 + 50"
                    :y="270 - (point.usefulness / 100) * 250 - 15"
                    text-anchor="middle" 
                    font-size="11" 
                    fill="#333" 
                    font-weight="bold"
                  >
                    U: {{ point.usefulness }}
                  </text>
                  <text 
                    :x="50 + (point.easeOfUse / 100) * 430 + 50"
                    :y="270 - (point.usefulness / 100) * 250 - 3"
                    text-anchor="middle" 
                    font-size="11" 
                    fill="#666"
                  >
                    E: {{ point.easeOfUse }}
                  </text>
                </g>
              </svg>
              <div class="d-flex justify-center gap-2 mt-2">
                <div class="d-flex align-center gap-1">
                  <div style="width: 10px; height: 10px; border-radius: 50%; background: #2196F3;"></div>
                  <span class="text-caption">Respondents</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card elevation="2" style="border-radius: 12px; height: 100%;">
            <v-card-title class="text-h6 pa-4">
              Average Construct Scores
            </v-card-title>
            <v-card-text class="pa-6">
              <div v-for="(score, dimension) in getCoreDimensions()" :key="dimension" class="mb-5">
                <!-- Dimension Name -->
                <div class="text-body-2 font-weight-medium mb-2" :style="{ color: getDimensionColorByLabel(dimension) }">
                  {{ dimension }}
                </div>
                
                <!-- Progress Bar with Value Inside -->
                <div style="position: relative; height: 28px; display: flex; align-items: center;">
                  <v-progress-linear
                    :model-value="score"
                    :color="getDimensionColorByLabel(dimension)"
                    height="28"
                    rounded
                    style="position: absolute; width: 100%;"
                  />
                  <div style="position: relative; z-index: 1; width: 100%; text-align: center;">
                    <span class="font-weight-bold text-white" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3); font-size: 13px;">
                      {{ score }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>


      <!-- Respondent Details Section -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold mb-4">
            Respondent Details
          </h2>
        </v-col>
        <v-col cols="12">
          <v-card elevation="2" style="border-radius: 12px;">
            <!-- Filters -->
            <v-card-text class="pa-4 border-bottom">
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    v-model="filterVersion"
                    :items="['All Versions', ...availableVersions]"
                    label="Filter by TAM Version"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    v-model="filterLevel"
                    :items="['All Levels', 'High', 'Medium', 'Low']"
                    label="Filter by Acceptance Level"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <div class="text-body-2 font-weight-medium mb-2">
                    Acceptance Range: {{ acceptanceRange[0].toFixed(1) }} - {{ acceptanceRange[1].toFixed(1) }}
                  </div>
                  <v-range-slider
                    v-model="acceptanceRange"
                    :min="1"
                    :max="7"
                    :step="0.1"
                    color="primary"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <!-- Data Table -->
            <v-data-table
              :headers="getTableHeaders(selectedVersion)"
              :items="filteredResponses"
              items-per-page="10"
              class="elevation-0"
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
    </v-container>
  </v-card>

  <!-- Details Modal -->
  <v-dialog
    v-model="detailsModal"
    max-width="700px"
  >
    <v-card v-if="selectedResponse">
      <v-card-title class="text-h5 pa-6">
        Respondent Details: {{ selectedResponse.fullName || 'Anonymous' }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12">
            <h3 class="text-h6 font-weight-bold mb-4">
              Dimension Scores
            </h3>
          </v-col>
          <v-col
            v-for="(score, dimension) in selectedResponse.dimensionScores"
            :key="dimension"
            cols="12"
            sm="6"
          >
            <div class="mb-3">
              <div class="text-body-2 font-weight-medium mb-2">
                {{ dimension }}
              </div>
              <div class="text-h6 font-weight-bold mb-2">
                {{ score }}
              </div>
              <v-progress-linear
                :model-value="score"
                :color="getDimensionColor(dimension)"
                height="6"
                rounded
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="detailsModal = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
// Force cache bust: v2
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
  // First, check test structure for all created TAM tasks
  const versionsFromTest = new Set();
  
  if (test.value?.userTasks) {
    Object.entries(test.value.userTasks).forEach(([taskId, task]) => {
      if (task.taskType && (task.taskType.includes('tam-1') || task.taskType.includes('tam-2') || task.taskType.includes('tam-3'))) {
        const versionKey = task.taskType.replace('-', '');
        versionsFromTest.add(versionKey);
        console.log(`Found TAM task in test structure: ${versionKey} from ${task.taskType}`);
      }
    });
  }
  
  // Then check actual data for versions with responses
  const versionsWithData = new Set(
    tamData.value.map(item => item.taskType.replace('-', ''))
  );
  
  console.log('TAM versions in test structure:', Array.from(versionsFromTest));
  console.log('TAM versions with response data:', Array.from(versionsWithData));
  
  // Combine both: show all created TAM tasks, prioritizing ones with data
  const allVersions = new Set([...versionsFromTest, ...versionsWithData]);
  const result = Array.from(allVersions).sort();
  
  console.log('Final availableVersions:', result);
  
  return result.length > 0 ? result : [];
})

// Generate scatter plot data showing Perceived Usefulness vs Ease of Use
const scatterPlotData = computed(() => {
  const points = [];
  
  // Get all TAM responses
  tamData.value.forEach((item, idx) => {
    if (!item.tamAnswers) return;
    
    const answers = item.tamAnswers;
    
    // Calculate Perceived Usefulness (tam1_pu)
    const puAnswers = [];
    const euAnswers = [];
    
    Object.entries(answers).forEach(([key, value]) => {
      if (key.includes('pu') || key.includes('usefulness')) {
        puAnswers.push(Number(value) || 0);
      }
      if (key.includes('eu') || key.includes('ease')) {
        euAnswers.push(Number(value) || 0);
      }
    });
    
    // Calculate averages (convert from 1-5 scale to 0-100)
    const puAvg = puAnswers.length > 0 
      ? ((puAnswers.reduce((a, b) => a + b, 0) / puAnswers.length - 1) / 4 * 100) 
      : 0;
    const euAvg = euAnswers.length > 0 
      ? ((euAnswers.reduce((a, b) => a + b, 0) / euAnswers.length - 1) / 4 * 100) 
      : 0;
    
    if (puAvg > 0 || euAvg > 0) {
      points.push({
        usefulness: Math.round(puAvg),
        easeOfUse: Math.round(euAvg),
        color: '#2196F3',
        hovered: false,
        respondent: item.fullName || `User ${idx + 1}`
      });
    }
  });
  
  return points;
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

// Filter states
const filterVersion = ref('All Versions')
const filterLevel = ref('All Levels')
const acceptanceRange = ref([1, 7])

// Computed property for filtered responses
const filteredResponses = computed(() => {
  return analytics.value.responses
    .filter(item => {
      // Version filter
      if (filterVersion.value !== 'All Versions') {
        const itemVersion = item.taskType.replace('-', '').toLowerCase()
        if (itemVersion !== filterVersion.value.toLowerCase()) {
          return false
        }
      }
      
      // Acceptance range filter
      if (item.overallScore < acceptanceRange.value[0] || item.overallScore > acceptanceRange.value[1]) {
        return false
      }
      
      // Acceptance level filter
      if (filterLevel.value !== 'All Levels') {
        const level = getAcceptanceLevel(item.overallScore)
        const filterLevelMap = {
          'High': ['High', 'Very High'],
          'Medium': ['Moderate'],
          'Low': ['Low', 'Very Low']
        }
        if (!filterLevelMap[filterLevel.value]?.includes(level)) {
          return false
        }
      }
      
      return true
    })
    .map((item, index) => ({
      ...item,
      name: item.fullName || 'Anonymous',
      key: index
    }))
})

// Get count of unique TAM versions used
function getUsedVersionsCount() {
  // Count all TAM versions created in the test (from test structure)
  let count = 0;
  const uniqueVersions = new Set();
  
  if (test.value?.userTasks) {
    Object.entries(test.value.userTasks).forEach(([taskId, task]) => {
      if (task.taskType && (task.taskType.includes('tam-1') || task.taskType.includes('tam-2') || task.taskType.includes('tam-3'))) {
        const versionKey = task.taskType.replace('-', '');
        uniqueVersions.add(versionKey);
      }
    });
  }
  
  count = uniqueVersions.size;
  console.log('Unique TAM versions in test:', Array.from(uniqueVersions), 'Count:', count);
  
  return count > 0 ? count : 0;
}

// Get highest scoring dimension
function getHighestConstruct() {
  if (!analytics.value.dimensionAverages || Object.keys(analytics.value.dimensionAverages).length === 0) {
    return 'N/A'
  }
  
  const entries = Object.entries(analytics.value.dimensionAverages)
  if (entries.length === 0) return 'N/A'
  
  const sorted = entries.sort((a, b) => (b[1] || 0) - (a[1] || 0))
  const topKey = sorted[0][0]
  
  // Find the dimension label for this key
  const activeDims = getActiveDimensions(selectedVersion.value)
  const dimension = activeDims.find(d => d.key === topKey)
  return dimension ? dimension.label.split(' ')[0] : topKey
}

// Get the score of the highest construct
function getHighestConstructScore() {
  if (!analytics.value.dimensionAverages || Object.keys(analytics.value.dimensionAverages).length === 0) {
    return '0'
  }
  
  const scores = Object.values(analytics.value.dimensionAverages)
  const maxScore = Math.max(...scores.filter(s => typeof s === 'number'))
  return isFinite(maxScore) ? maxScore.toFixed(1) : '0'
}

// Get core dimensions and their scores for the bar chart
function getCoreDimensions() {
  const activeDimensions = getActiveDimensions(selectedVersion.value)
  const result = {}
  
  activeDimensions.forEach(dim => {
    const score = analytics.value.dimensionAverages[dim.key] || 0
    result[dim.label] = score
  })
  
  return result
}

// Get color for a dimension by label
function getDimensionColorByLabel(dimensionLabel) {
  const activeDimensions = getActiveDimensions(selectedVersion.value)
  const dimension = activeDimensions.find(d => d.label === dimensionLabel)
  return dimension ? dimension.color : '#2196F3'
}

// Get color for a dimension
function getDimensionColor(dimensionKey) {
  const activeDimensions = getActiveDimensions(selectedVersion.value)
  const dimension = activeDimensions.find(d => d.key === dimensionKey)
  return dimension ? dimension.color : '#999999'
}

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
