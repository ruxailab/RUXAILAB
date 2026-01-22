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
        <v-col cols="12" sm="6" md="4" class="d-flex">
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
        <v-col cols="12" sm="6" md="4" class="d-flex">
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

        <!-- Highest Construct -->
        <v-col cols="12" sm="6" md="4" class="d-flex">
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
            <v-card-text class="pa-6">
              <div style="position: relative; height: 300px; width: 100%;">
                <Scatter 
                  v-if="scatterChartData.datasets[0].data.length > 0"
                  :data="scatterChartData" 
                  :options="scatterChartOptions"
                  style="height: 100%;"
                />
                <div v-else class="d-flex align-center justify-center" style="height: 100%; color: #999;">
                  <p>No data available yet</p>
                </div>
              </div>
              <div class="d-flex justify-center gap-2 mt-4">
                <div class="d-flex align-center gap-1">
                  <div style="width: 10px; height: 10px; border-radius: 50%; background: #2196F3;"></div>
                  <span class="text-caption">{{ scatterChartData.datasets[0].data.length }} Respondents</span>
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
              <!-- Construct Bars with Values -->
              <div v-for="(score, dimension) in getCoreDimensions()" :key="dimension" class="mb-4">
                <!-- Dimension Name and Score -->
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-body-2 font-weight-medium text-grey-darken-1">
                    {{ dimension }}
                  </div>
                  <div class="text-h6 font-weight-bold" :style="{ color: getDimensionColorByLabel(dimension) }">
                    {{ score.toFixed(1) }}
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <v-progress-linear
                  :model-value="score"
                  :color="getDimensionColorByLabel(dimension)"
                  height="24"
                  rounded
                />
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
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    v-model="filterLevel"
                    :items="['All Levels', 'High', 'Medium', 'Low']"
                    label="Filter by Acceptance Level"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <div class="text-body-2 font-weight-medium mb-2">
                    Acceptance Range: {{ acceptanceRange[0].toFixed(1) }} - {{ acceptanceRange[1].toFixed(1) }}
                  </div>
                  <v-range-slider
                    v-model="acceptanceRange"
                    :min="0"
                    :max="100"
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
              <!-- Dynamic dimension score templates -->
              <template
                v-for="dim in getActiveDimensions(selectedVersion)"
                :key="`item-${dim.key}`"
                #[`item.${dim.key}`]="{ item }"
              >
                <div class="text-body-2 font-weight-medium" :style="{ color: dim.color }">
                  {{ item.dimensionScores?.[dim.key]?.toFixed(1) || '-' }}
                </div>
              </template>

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
    max-width="900px"
  >
    <v-card v-if="selectedResponse">
      <v-card-title class="text-h5 pa-6">
        Respondent Details: {{ selectedResponse.fullName || 'Anonymous' }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-6">
        <!-- Dimension Scores with Clickable Cards -->
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
            <v-card
              :ripple="true"
              :class="{ 'border-2 border-primary': selectedConstructForDetails === dimension }"
              class="cursor-pointer mb-3"
              @click="() => { console.log('🖱️ Clicked dimension:', dimension); selectedConstructForDetails = dimension; }"
            >
              <v-card-text>
                <div class="text-body-2 font-weight-medium mb-2">
                  {{ getDimensionLabel(dimension) }}
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
                <div class="text-caption text-grey mt-2">
                  Click to view answers
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Answers for Selected Construct -->
        <v-row v-if="selectedConstructForDetails && getConstructAnswers(selectedConstructForDetails).length > 0" class="mt-4">
          <v-col cols="12">
            <v-divider class="mb-4" />
            <h3 class="text-h6 font-weight-bold mb-4">
              Answers for: {{ selectedConstructForDetails }}
            </h3>
          </v-col>
          <v-col cols="12">
            <v-card
              v-for="(answer, index) in getConstructAnswers(selectedConstructForDetails)"
              :key="index"
              variant="outlined"
              class="mb-3 pa-4"
            >
              <div class="text-body-2 font-weight-medium mb-2">
                <span class="text-primary font-weight-bold">{{ index + 1 }}.</span>
                {{ answer.question }}
              </div>
              <div class="text-h6 font-weight-bold text-success">
                {{ answer.answer }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn v-if="selectedConstructForDetails" color="secondary" variant="text" @click="selectedConstructForDetails = null">
          Clear Selection
        </v-btn>
        <v-btn color="primary" variant="text" @click="detailsModal = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
// Force cache bust: v2
import { ref, computed, watchEffect, nextTick } from 'vue'
import { useStore } from 'vuex'
import { calculateTAMScore} from '../../utils/tamCalculator'
import { Scatter, Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, Legend, Tooltip, Title } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Legend, Tooltip, Title)

const store = useStore()

// TAM Dimensions Data
const TAM_DIMENSIONS = {
  tam1: [
    { key: 'tam1_pu', label: 'Perceived Usefulness', description: 'The system improves job performance', color: '#2196F3' },
    { key: 'tam1_eu', label: 'Perceived Ease of Use', description: 'The system is easy to interact with', color: '#4CAF50' }
  ],
  tam2: [
    { key: 'tam2_int', label: 'Intention to Use', description: 'Intent to use the system', color: '#673AB7' },
    { key: 'tam2_pu', label: 'Perceived Usefulness', description: 'The system improves job performance', color: '#2196F3' },
    { key: 'tam2_eu', label: 'Perceived Ease of Use', description: 'The system is easy to interact with', color: '#4CAF50' },
    { key: 'tam2_sn', label: 'Subjective Norm', description: 'Others influence usage', color: '#FF9800' },
    { key: 'tam2_vol', label: 'Voluntariness', description: 'Voluntary vs mandatory use', color: '#E91E63' },
    { key: 'tam2_img', label: 'Image', description: 'Status and prestige impact', color: '#9C27B0' },
    { key: 'tam2_jr', label: 'Job Relevance', description: 'Relevance to job tasks', color: '#00BCD4' },
    { key: 'tam2_oq', label: 'Output Quality', description: 'Quality of results', color: '#8BC34A' },
    { key: 'tam2_rd', label: 'Result Demonstrability', description: 'Observable results', color: '#FF5722' }
  ],
  tam3: [
    // Core TAM constructs
    { key: 'tam3_pu', label: 'Perceived Usefulness (PU)', description: 'Job performance enhancement', color: '#2196F3' },
    { key: 'tam3_eu', label: 'Perceived Ease of Use (PEOU)', description: 'Effort to use the system', color: '#4CAF50' },
    { key: 'tam3_bi', label: 'Behavioral Intention (BI)', description: 'Intent to use the system', color: '#673AB7' },
    { key: 'tam3_use', label: 'Use Behavior (USE)', description: 'Actual usage frequency and time', color: '#FF9800' },
    // Determinants of PU
    { key: 'tam3_sn', label: 'Subjective Norm (SN)', description: 'Others influence usage', color: '#E91E63' },
    { key: 'tam3_img', label: 'Image (IMG)', description: 'Status and prestige impact', color: '#9C27B0' },
    { key: 'tam3_jr', label: 'Job Relevance (REL)', description: 'Relevance to job tasks', color: '#00BCD4' },
    { key: 'tam3_oq', label: 'Output Quality (OUT)', description: 'Quality of results', color: '#8BC34A' },
    { key: 'tam3_rd', label: 'Result Demonstrability (RES)', description: 'Observable results', color: '#FF5722' },
    // Determinants of PEOU - Anchors
    { key: 'tam3_cse', label: 'Computer Self-Efficacy (CSE)', description: 'Confidence in using systems', color: '#03A9F4' },
    { key: 'tam3_ec', label: 'External Control (PEC)', description: 'External support availability', color: '#009688' },
    { key: 'tam3_anx', label: 'Computer Anxiety (CANX)', description: 'Apprehension about use', color: '#F44336' },
    { key: 'tam3_pf', label: 'Computer Playfulness (CPLAY)', description: 'Enjoyment of system use', color: '#FF5722' },
    // Determinants of PEOU - Adjustments
    { key: 'tam3_enj', label: 'Perceived Enjoyment (ENJ)', description: 'Intrinsic motivation', color: '#FFEB3B' },
    { key: 'tam3_ou', label: 'Objective Usability (OU)', description: 'Actual system ease of use', color: '#4CAF50' },
    // Moderators
    { key: 'tam3_exp', label: 'Experience (EXP)', description: 'Prior system experience', color: '#2E7D32' },
    { key: 'tam3_vol', label: 'Voluntariness (VOL)', description: 'Voluntary vs mandatory use', color: '#455A64' }
  ]
}

const analytics = ref({
  averageOverallScore: 0,
  totalRespondents: 0,
  dimensionAverages: {},
  responses: []
})

const selectedVersion = ref('')

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
  
  // Set initial selectedVersion if not already set
  if (!selectedVersion.value && result.length > 0) {
    selectedVersion.value = result[result.length - 1]; // Select highest version (tam3 > tam2 > tam1)
  }
  
  return result.length > 0 ? result : [];
})

// Generate scatter plot data showing Perceived Usefulness vs Ease of Use
const scatterPlotData = computed(() => {
  const points = [];
  
  // Only use data for the selected TAM version
  const selectedVersionFull = selectedVersion.value.includes('-') ? selectedVersion.value : `tam-${selectedVersion.value.slice(-1)}`;
  console.log('Generating scatter plot for version:', selectedVersionFull);
  
  // Get TAM responses matching the selected version
  const versionData = tamData.value.filter(item => item.taskType === selectedVersionFull);
  console.log('Filtered data for version:', versionData.length, 'responses');
  
  versionData.forEach((item, idx) => {
    if (!item.tamAnswers) {
      console.log('No tamAnswers for item:', idx);
      return;
    }
    
    const answers = item.tamAnswers;
    console.log('Processing item', idx, 'with answers:', Object.keys(answers));
    
    let puValues = [];
    let euValues = [];
    
    // Determine which version we're looking at
    const itemVersion = item.taskType; // 'tam-1', 'tam-2', 'tam-3'
    
    // Handle TAM-2 structure (arrays of answers with full names)
    if (itemVersion === 'tam-2') {
      if (answers.perceivedUsefulness && Array.isArray(answers.perceivedUsefulness)) {
        puValues = answers.perceivedUsefulness.filter(v => typeof v === 'number');
      }
      if (answers.perceivedEaseOfUse && Array.isArray(answers.perceivedEaseOfUse)) {
        euValues = answers.perceivedEaseOfUse.filter(v => typeof v === 'number');
      }
    }
    // Handle TAM-3 structure (abbreviated keys)
    else if (itemVersion === 'tam-3') {
      // Look for tam3_pu or pu data
      if (answers.tam3_pu !== undefined) {
        if (Array.isArray(answers.tam3_pu)) {
          puValues = answers.tam3_pu.filter(v => typeof v === 'number');
        } else if (typeof answers.tam3_pu === 'number') {
          puValues = [answers.tam3_pu];
        }
      } else if (answers.perceivedUsefulness) {
        if (Array.isArray(answers.perceivedUsefulness)) {
          puValues = answers.perceivedUsefulness.filter(v => typeof v === 'number');
        } else if (typeof answers.perceivedUsefulness === 'number') {
          puValues = [answers.perceivedUsefulness];
        }
      }
      
      if (answers.tam3_eu !== undefined) {
        if (Array.isArray(answers.tam3_eu)) {
          euValues = answers.tam3_eu.filter(v => typeof v === 'number');
        } else if (typeof answers.tam3_eu === 'number') {
          euValues = [answers.tam3_eu];
        }
      } else if (answers.perceivedEaseOfUse) {
        if (Array.isArray(answers.perceivedEaseOfUse)) {
          euValues = answers.perceivedEaseOfUse.filter(v => typeof v === 'number');
        } else if (typeof answers.perceivedEaseOfUse === 'number') {
          euValues = [answers.perceivedEaseOfUse];
        }
      }
    }
    // Handle TAM-1 structure (abbreviated keys)
    else if (itemVersion === 'tam-1') {
      if (answers.tam1_pu !== undefined) {
        if (Array.isArray(answers.tam1_pu)) {
          puValues = answers.tam1_pu.filter(v => typeof v === 'number');
        } else if (typeof answers.tam1_pu === 'number') {
          puValues = [answers.tam1_pu];
        }
      } else if (answers.perceivedUsefulness) {
        if (Array.isArray(answers.perceivedUsefulness)) {
          puValues = answers.perceivedUsefulness.filter(v => typeof v === 'number');
        } else if (typeof answers.perceivedUsefulness === 'number') {
          puValues = [answers.perceivedUsefulness];
        }
      }
      
      if (answers.tam1_eu !== undefined) {
        if (Array.isArray(answers.tam1_eu)) {
          euValues = answers.tam1_eu.filter(v => typeof v === 'number');
        } else if (typeof answers.tam1_eu === 'number') {
          euValues = [answers.tam1_eu];
        }
      } else if (answers.perceivedEaseOfUse) {
        if (Array.isArray(answers.perceivedEaseOfUse)) {
          euValues = answers.perceivedEaseOfUse.filter(v => typeof v === 'number');
        } else if (typeof answers.perceivedEaseOfUse === 'number') {
          euValues = [answers.perceivedEaseOfUse];
        }
      }
    }
    
    // Calculate averages (convert from scale to 0-100)
    // TAM-1 and TAM-2 use 7-point scale: (average - 1) / 6 * 100
    // TAM-3 uses 5-point scale: (average - 1) / 4 * 100
    const scaleMax = selectedVersionFull === 'tam-3' ? 5 : 7;
    const denominator = scaleMax - 1;
    
    const puAvg = puValues.length > 0 
      ? ((puValues.reduce((a, b) => a + b, 0) / puValues.length - 1) / denominator * 100) 
      : 0;
    const euAvg = euValues.length > 0 
      ? ((euValues.reduce((a, b) => a + b, 0) / euValues.length - 1) / denominator * 100) 
      : 0;
    
    console.log(`Item ${idx} (${itemVersion}): scaleMax=${scaleMax}, denominator=${denominator}, PU avg=${puAvg}, EU avg=${euAvg}, PU values=${puValues}, EU values=${euValues}`);
    
    // Add point if we have at least some data
    if (puValues.length > 0 || euValues.length > 0) {
      points.push({
        usefulness: Math.round(puAvg),
        easeOfUse: Math.round(euAvg),
        color: '#2196F3',
        hovered: false,
        respondent: item.fullName || `User ${idx + 1}`
      });
      console.log(`✓ Added point for ${item.fullName || `User ${idx + 1}`}: U=${Math.round(puAvg)}, E=${Math.round(euAvg)}`);
    }
  });
  
  console.log('Total scatter plot points:', points.length);
  return points;
})

// Compute chart data for vue-chartjs
const scatterChartData = computed(() => {
  const chartDataPoints = scatterPlotData.value.map(point => ({
    x: point.easeOfUse,
    y: point.usefulness,
    label: point.respondent
  }));

  return {
    datasets: [{
      label: 'Respondents',
      data: chartDataPoints,
      backgroundColor: '#2196F3',
      borderColor: '#1976D2',
      borderWidth: 1,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBorderColor: '#1976D2',
      pointBorderWidth: 2
    }]
  };
})

// Scatter chart options
const scatterChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      callbacks: {
        label: function(context) {
          const label = context.raw.label || '';
          return `${label}: U=${context.raw.y}, E=${context.raw.x}`;
        },
        afterLabel: function(context) {
          return '';
        }
      }
    }
  },
  scales: {
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Perceived Ease of Use',
        font: { size: 13, weight: 'bold' }
      },
      min: 0,
      max: 100,
      ticks: {
        stepSize: 25
      }
    },
    y: {
      title: {
        display: true,
        text: 'Perceived Usefulness',
        font: { size: 13, weight: 'bold' }
      },
      min: 0,
      max: 100,
      ticks: {
        stepSize: 25
      }
    }
  }
}

// Compute bar chart data for construct scores
const constructScoresChartData = computed(() => {
  const coreDimensions = getCoreDimensions();
  const labels = Object.keys(coreDimensions);
  const scores = Object.values(coreDimensions);
  const colors = labels.map(label => getDimensionColorByLabel(label));
  
  return {
    labels,
    datasets: [{
      label: 'Average Score',
      data: scores,
      backgroundColor: colors,
      borderColor: colors,
      borderWidth: 1,
      borderRadius: 4
    }]
  };
});

// Bar chart options
const constructScoresChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 8,
      callbacks: {
        label: function(context) {
          return `${context.parsed.x.toFixed(1)}`;
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20
      }
    }
  }
}

const detailsModal = ref(false)
const selectedResponse = ref(null)
const selectedConstructForDetails = ref(null)

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
  
  console.log('🔍 tamData computation started, testAnswerDocument entries:', Object.keys(testAnswerDocument.value).length);
  
  Object.entries(testAnswerDocument.value || {}).forEach(([userId, answerItem]) => {
    if (!answerItem || !answerItem.tasks) {
      console.log(`⚠️ Skipping user ${userId}: no tasks`);
      return;
    }
    
    console.log(`👤 Processing user ${userId}:`, Object.keys(answerItem.tasks || {}).length, 'tasks');
    
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
      
      console.log(`  📋 Task ${taskId}: type=${taskType}, hasTamAnswers=${!!task.tamAnswers}, answersCount=${task.tamAnswers ? Object.keys(task.tamAnswers).length : 0}`);
      
      // Check if this is a TAM task with answers
      if (['tam-1', 'tam-2', 'tam-3'].includes(taskType) && 
          task.tamAnswers && 
          typeof task.tamAnswers === 'object' && 
          Object.keys(task.tamAnswers).length > 0) {
        
        console.log(`  ✅ Added TAM task for user ${userId}`);
        
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
  
  console.log('✅ tamData computed: found', allData.length, 'TAM responses');
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
  const dimensionHeaders = activeDimensions.map(dim => {
    // Create shorter but clearer headers
    let shortLabel = dim.label
    if (dim.label === 'Perceived Usefulness') shortLabel = 'PU'
    if (dim.label === 'Perceived Ease of Use') shortLabel = 'PEOU'
    if (dim.label === 'Attitude Toward Using') shortLabel = 'ATT'
    if (dim.label === 'Actual System Use') shortLabel = 'USE'
    
    return {
      title: shortLabel,
      key: dim.key,
      sortable: true
    }
  })

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

function getDimensionLabel(dimensionKey) {
  const version = selectedVersion.value.includes('-') ? selectedVersion.value.split('-')[1] : selectedVersion.value.slice(-1)
  const versionKey = `tam${version}`
  const dimensions = TAM_DIMENSIONS[versionKey] || []
  const found = dimensions.find(d => d.key === dimensionKey)
  return found ? found.label : dimensionKey
}

function openDetails(response) {
  console.log('📋 openDetails called with response:', response);
  console.log('  - tamAnswers exists?', !!response.tamAnswers);
  console.log('  - tamAnswers properties:', response.tamAnswers ? Object.keys(response.tamAnswers) : 'N/A');
  selectedResponse.value = response
  detailsModal.value = true
}

function getConstructAnswers(constructKey) {
  console.log('🔍 getConstructAnswers called with constructKey:', constructKey);
  
  if (!selectedResponse.value) {
    console.log('❌ No selectedResponse');
    return []
  }
  
  if (!selectedResponse.value.tamAnswers) {
    console.log('❌ No selectedResponse.tamAnswers');
    console.log('Available properties in selectedResponse:', Object.keys(selectedResponse.value));
    return []
  }
  
  console.log('✅ Found tamAnswers, available properties:', Object.keys(selectedResponse.value.tamAnswers));

  // Define question templates for each construct
  const questions = {
    'tam1_pu': [
      'Using the system has a positive effect on my job effectiveness',
      'Using the system has a positive effect on my job productivity',
      'Using the system has a positive effect on my job performance',
      'Using the system has a positive effect on my ability to accomplish job tasks',
      'Using the system has a positive effect on my ability to control my work',
      'Using the system has a positive effect on my work quality',
      'Using the system has a positive effect on my work efficiency',
      'Using the system enables me to accomplish more',
      'Using the system improves my ability to do my job',
      'Using the system makes it easier to do my job'
    ],
    'tam1_eu': [
      'Overall, I find the system easy to use',
      'Overall, I find the system convenient to use',
      'Overall, I find the system intuitive to use',
      'Overall, I find the system user-friendly to use',
      'Overall, I find the system clear to use',
      'Overall, I find the system simple to use',
      'Overall, I find the system straightforward to use',
      'Overall, I find interaction with the system easy',
      'Overall, I find the system flexible to use',
      'Overall, I find learning to use the system easy'
    ],
    'tam1_att': [
      'Good - Bad',
      'Wise - Foolish',
      'Positive - Negative',
      'Favorable - Unfavorable',
      'Beneficial - Harmful'
    ],
    'tam1_use': [
      'Frequency of use',
      'Hours per week'
    ],
    // TAM-2 questions
    'tam2_int': [
      'Assuming I have access to the system, I intend to use it',
      'Given that I have access to the system, I predict that I would use it'
    ],
    'tam2_pu': [
      'Using the system improves my performance in my job',
      'Using the system in my job increases my productivity',
      'Using the system enhances my effectiveness in my job',
      'I find the system to be useful in my job'
    ],
    'tam2_eu': [
      'My interaction with the system is clear and understandable',
      'Interacting with the system does not require a lot of my mental effort',
      'I find the system to be easy to use',
      'I find it easy to get the system to do what I want it to do'
    ],
    'tam2_sn': [
      'People who influence my behavior think that I should use the system',
      'People who are important to me think that I should use the system'
    ],
    'tam2_vol': [
      'My use of the system is voluntary',
      'My supervisor does not require me to use the system',
      'Although it might be helpful, using the system is certainly not compulsory in my job'
    ],
    'tam2_img': [
      'People in my organization who use the system have more prestige than those who do not',
      'People in my organization who use the system have a high profile',
      'Having the system is a status symbol in my organization'
    ],
    'tam2_jr': [
      'In my job, usage of the system is important',
      'In my job, usage of the system is relevant'
    ],
    'tam2_oq': [
      'The quality of the output I get from the system is high',
      'I have no problem with the quality of the system\'s output'
    ],
    'tam2_rd': [
      'I have no difficulty telling others about the results of using the system',
      'I believe I could communicate to others the consequences of using the system',
      'The results of using the system are apparent to me',
      'I would have difficulty explaining why using the system may or may not be beneficial'
    ]
  }

  const answers = selectedResponse.value.tamAnswers
  const constructAnswers = []
  
  // TAM-2 constructs
  if (constructKey === 'tam2_int' && answers.intentionToUse) {
    console.log('✓ Matching tam2_int, found intentionToUse:', answers.intentionToUse);
    answers.intentionToUse.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam2_int'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam2_pu' && answers.perceivedUsefulness) {
    console.log('✓ Matching tam2_pu, found perceivedUsefulness:', answers.perceivedUsefulness);
    answers.perceivedUsefulness.forEach((answer, index) => {
      if (answer !== undefined && index < 4) {
        constructAnswers.push({
          question: questions['tam2_pu'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam2_eu' && answers.perceivedEaseOfUse) {
    console.log('✓ Matching tam2_eu, found perceivedEaseOfUse:', answers.perceivedEaseOfUse);
    answers.perceivedEaseOfUse.forEach((answer, index) => {
      if (answer !== undefined && index < 4) {
        constructAnswers.push({
          question: questions['tam2_eu'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam2_sn' && answers.subjectiveNorm) {
    console.log('✓ Matching tam2_sn, found subjectiveNorm:', answers.subjectiveNorm);
    answers.subjectiveNorm.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam2_sn'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam2_vol' && answers.voluntariness) {
    console.log('✓ Matching tam2_vol, found voluntariness:', answers.voluntariness);
    answers.voluntariness.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam2_vol'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam2_img' && answers.image) {
    console.log('✓ Matching tam2_img, found image:', answers.image);
    answers.image.forEach((answer, index) => {
      if (answer !== undefined && index < 3) {
        constructAnswers.push({
          question: questions['tam2_img'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam2_jr' && answers.jobRelevance) {
    console.log('✓ Matching tam2_jr, found jobRelevance:', answers.jobRelevance);
    answers.jobRelevance.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam2_jr'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam2_oq' && answers.outputQuality) {
    console.log('✓ Matching tam2_oq, found outputQuality:', answers.outputQuality);
    answers.outputQuality.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam2_oq'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam2_rd' && answers.resultDemonstrability) {
    console.log('✓ Matching tam2_rd, found resultDemonstrability:', answers.resultDemonstrability);
    answers.resultDemonstrability.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam2_rd'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam1_pu' && answers.perceivedUsefulness) {
    answers.perceivedUsefulness.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam1_pu'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam1_eu' && answers.perceivedEaseOfUse) {
    answers.perceivedEaseOfUse.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam1_eu'][index] || `Question ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam1_att' && answers.attitudeTowardUsing) {
    answers.attitudeTowardUsing.forEach((answer, index) => {
      if (answer !== undefined) {
        constructAnswers.push({
          question: questions['tam1_att'][index] || `Item ${index + 1}`,
          answer: answer
        })
      }
    })
  } else if (constructKey === 'tam1_use' && answers.actualSystemUse) {
    const useFrequencyOptions = [
      'Less than once a month',
      '1 - 2 times a month',
      '1 - 2 times a week',
      'About once a day',
      'Several times a day',
      'Constantly throughout the day'
    ]
    if (answers.actualSystemUse[0] !== undefined) {
      constructAnswers.push({
        question: questions['tam1_use'][0],
        answer: useFrequencyOptions[answers.actualSystemUse[0]] || `Option ${answers.actualSystemUse[0]}`
      })
    }
    if (answers.actualSystemUse[1] !== undefined) {
      constructAnswers.push({
        question: questions['tam1_use'][1],
        answer: `${answers.actualSystemUse[1]} hours`
      })
    }
  }
  
  console.log('🎯 Returning constructAnswers for key', constructKey, ':', constructAnswers);
  return constructAnswers
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
      'tam1_att': 'attitudeTowardUsing',
      'tam1_use': 'actualSystemUse',
      'tam2_int': 'intentionToUse',
      'tam2_pu': 'perceivedUsefulness',
      'tam2_eu': 'perceivedEaseOfUse',
      'tam2_sn': 'subjectiveNorm',
      'tam2_vol': 'voluntariness',
      'tam2_img': 'image',
      'tam2_jr': 'jobRelevance',
      'tam2_oq': 'outputQuality',
      'tam2_rd': 'resultDemonstrability',
      'tam3_pu': 'perceivedUsefulness',
      'tam3_eu': 'perceivedEaseOfUse',
      'tam3_bi': 'behavioralIntention',
      'tam3_use': 'usePatterns',
      'tam3_sn': 'subjectiveNorm',
      'tam3_img': 'image',
      'tam3_jr': 'jobRelevance',
      'tam3_oq': 'outputQuality',
      'tam3_rd': 'resultDemonstrability',
      'tam3_cse': 'computerSelfEfficacy',
      'tam3_ec': 'perceptionsOfExternalControl',
      'tam3_anx': 'computerAnxiety',
      'tam3_pf': 'computerPlayfulness',
      'tam3_enj': 'perceivedEnjoyment',
      'tam3_ou': 'objectiveUsability',
      'tam3_exp': 'experience',
      'tam3_vol': 'voluntariness'
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
const acceptanceRange = ref([0, 100])

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
  
  // Find the dimension label for this key - directly from TAM_DIMENSIONS
  const versionNum = selectedVersion.value.includes('tam') ? selectedVersion.value.replace(/[^0-9]/g, '') : selectedVersion.value
  const versionKey = `tam${versionNum}`
  const dimensions = TAM_DIMENSIONS[versionKey] || []
  const dimension = dimensions.find(d => d.key === topKey)
  
  if (dimension) {
    // Return the label with abbreviation in parentheses
    return dimension.label
  }
  
  return topKey
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