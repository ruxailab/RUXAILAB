<template>
  <v-row class="ma-0">
    <!-- Sidebar -->
    <v-col
      cols="12"
      md="3"
      class="pa-2"
    >
      <v-card
        class="sidebar-card h-100"
        elevation="2"
      >
        <v-list
          v-model="selectedPrinciple"
          nav
        >
          <v-list-subheader class="text-h6">
            WCAG Principles
          </v-list-subheader>
          <v-list-item
            v-for="(principle, index) in principles"
            :key="index"
            :value="principle"
            density="compact"
            color="primary"
            @click="selectPrinciple(principle)"
          >
            <template #prepend>
              <v-icon>{{ getPrincipleIcon(principle.title) }}</v-icon>
            </template>
            <v-list-item-title>{{ principle.title }}</v-list-item-title>
            <v-list-item-subtitle class="text-wrap">
              {{ principle.description }}
            </v-list-item-subtitle>
          </v-list-item>

          <!-- All Principles Option -->
          <v-list-item
            density="compact"
            :value="null"
            color="primary"
            @click="selectAllPrinciples"
          >
            <template #prepend>
              <v-icon>mdi-check-all</v-icon>
            </template>
            <v-list-item-title>All Principles</v-list-item-title>
            <v-list-item-subtitle class="text-wrap">
              Test all WCAG principles
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <!-- Main Content -->
    <v-col
      cols="12"
      md="9"
      class="pa-2"
    >
      <!-- Progress bar with percentage -->
      <div
        v-if="!isComplete && isStarted"
        class="progress-container mb-3"
      >
        <v-progress-linear
          :model-value="progress"
          color="success"
          height="12"
          class="mt-0"
        />
        <div class="progress-percentage">
          {{ Math.round(progress) }}%
        </div>
      </div>

      <!-- Current principle being tested -->
      <v-row
        v-if="currentPrinciple && isStarted"
        justify="center"
        class="ma-0 mb-3"
      >
        <v-col
          cols="12"
          class="pa-0"
        >
          <v-chip
            color="primary"
            size="large"
          >
            <v-icon start>
              {{ getPrincipleIcon(currentPrinciple.title) }}
            </v-icon>
            Testing: {{ currentPrinciple.title }}
          </v-chip>
        </v-col>
      </v-row>

      <!-- Conformance level selection -->
      <v-row
        v-if="!isStarted"
        justify="center"
        class="ma-0"
      >
        <v-col
          cols="12"
          class="pa-0"
        >
          <v-card
            class="selection-card"
            elevation="3"
          >
            <v-card-title
              class="justify-center text-h5 bg-primary text-white py-4"
            >
              Select Conformance Level
            </v-card-title>
            <v-card-text class="pa-6">
              <p class="text-body-1 mb-5 text-grey-darken-1 text-center">
                Choose the WCAG conformance level you want to evaluate against:
              </p>
              <v-radio-group
                v-model="selectedConformanceLevel"
                class="mt-4"
              >
                <v-radio
                  label="Level A (Minimum level of conformance)"
                  value="A"
                />
                <v-radio
                  label="Level AA (Addresses the major barriers)"
                  value="AA"
                />
                <v-radio
                  label="Level AAA (Highest level of conformance)"
                  value="AAA"
                />
              </v-radio-group>
              <div class="d-flex justify-center mt-6">
                <v-btn
                  color="primary"
                  size="large"
                  min-width="200"
                  elevation="2"
                  @click="startAssessment"
                >
                  Start Assessment
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row
        v-if="isStarted"
        justify="center"
        class="ma-0"
      >
        <v-col
          cols="12"
          class="pa-0"
        >
          <v-card
            class="quiz-card"
            elevation="3"
          >
            <v-card-title
              class="justify-center text-h5 bg-primary text-white py-4"
            >
              <span v-if="!isComplete">
                {{ currentPrinciple ? currentPrinciple.title : 'All Principles' }}
                Accessibility Assessment (Level {{ selectedConformanceLevel }})
              </span>
              <span v-else>Assessment Complete!</span>
            </v-card-title>
            <v-card-text class="pa-6">
              <!-- Quiz in progress -->
              <div
                v-if="!isComplete"
                class="quiz-content"
              >
                <h2 class="text-h5 font-weight-bold mb-4 text-center">
                  {{ currentQuestion.title }}
                </h2>
                <p class="text-body-1 mb-5 text-grey-darken-1 text-center">
                  {{ currentQuestion.description }}
                </p>
                <v-card
                  border
                  class="pa-5 mb-8 criterion-card text-primary"
                >
                  <p class="text-body-1">
                    {{ currentCriterion }}
                  </p>
                  <!-- Evidence Upload Section -->
                  <v-file-input
                    v-model="currentEvidence"
                    accept="image/*"
                    label="Upload Screenshot Evidence"
                    prepend-icon="mdi-camera"
                    class="mt-4"
                    @update:model-value="handleEvidenceUpload"
                  />
                  <!-- Appraiser Notes -->
                  <v-textarea
                    v-model="currentNotes"
                    label="Appraiser Notes"
                    placeholder="Add your observations and notes here..."
                    rows="3"
                    class="mt-4"
                  />
                </v-card>
                <div
                  class="button-container d-flex align-center justify-center flex-wrap"
                >
                  <v-btn
                    color="success"
                    class="ma-2 answer-btn"
                    size="large"
                    min-width="120"
                    elevation="2"
                    @click="answerQuestion('yes')"
                  >
                    <v-icon start>
                      mdi-check
                    </v-icon>
                    Yes
                  </v-btn>
                  <v-btn
                    color="error"
                    class="ma-2 answer-btn"
                    size="large"
                    min-width="120"
                    elevation="2"
                    @click="answerQuestion('no')"
                  >
                    <v-icon start>
                      mdi-close
                    </v-icon>
                    No
                  </v-btn>
                  <v-btn
                    color="grey"
                    class="ma-2 answer-btn"
                    size="large"
                    min-width="120"
                    elevation="2"
                    @click="answerQuestion('na')"
                  >
                    <v-icon start>
                      mdi-minus
                    </v-icon>
                    N/A
                  </v-btn>
                </div>
              </div>

              <!-- Quiz results -->
              <div v-else>
                <v-tabs
                  v-model="activeTab"
                  bg-color="primary"
                  color="white"
                  grow
                >
                  <v-tab value="0">
                    <v-icon start>
                      mdi-check-circle
                    </v-icon>
                    Conformance Assessment
                  </v-tab>
                  <v-tab value="1">
                    <v-icon start>
                      mdi-chart-bar
                    </v-icon>
                    Level Results
                  </v-tab>
                  <v-tab value="2">
                    <v-icon start>
                      mdi-file-document
                    </v-icon>
                    Detailed Report
                  </v-tab>
                </v-tabs>
                <v-window v-model="activeTab">
                  <!-- Tab 1: Conformance Assessment -->
                  <v-window-item value="0">
                    <v-card flat>
                      <v-card-text>
                        <!-- Conformance Grade -->
                        <v-card
                          border
                          class="mb-6 pa-4 text-center"
                          elevation="1"
                        >
                          <v-card-title class="justify-center text-h5">
                            Conformance Assessment
                          </v-card-title>
                          <v-card-text>
                            <v-row>
                              <v-col cols="12">
                                <v-chip
                                  :color="getGradeColor(conformanceGrade.grade)"
                                  class="ma-2 pa-4 text-h5"
                                  size="large"
                                >
                                  {{ conformanceGrade.grade }}
                                </v-chip>
                                <div class="mt-3 text-body-1">
                                  {{ conformanceGrade.message }}
                                </div>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                        <!-- Summary -->
                        <v-card
                          border
                          class="mb-6 pa-4"
                          elevation="1"
                        >
                          <v-card-text>
                            <v-row>
                              <v-col
                                cols="12"
                                md="6"
                                class="text-center"
                              >
                                <v-sheet
                                  color="primary"
                                  rounded
                                  class="pa-4 mb-2"
                                >
                                  <div class="text-h3">
                                    {{ totalAnswered }}
                                  </div>
                                  <div class="text-subtitle-1">
                                    Total Criteria Checked
                                  </div>
                                </v-sheet>
                              </v-col>
                              <v-col
                                cols="12"
                                md="6"
                              >
                                <v-list density="compact">
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon
                                        color="success"
                                        size="28"
                                      >
                                        mdi-check-circle
                                      </v-icon>
                                    </template>
                                    <v-list-item-title
                                      class="text-subtitle-1"
                                    >
                                      Passing Criteria: {{ passCount }}
                                    </v-list-item-title>
                                  </v-list-item>
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon
                                        color="error"
                                        size="28"
                                      >
                                        mdi-alert-circle
                                      </v-icon>
                                    </template>
                                    <v-list-item-title
                                      class="text-subtitle-1"
                                    >
                                      Failed Criteria: {{ failCount }}
                                    </v-list-item-title>
                                  </v-list-item>
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon
                                        color="grey"
                                        size="28"
                                      >
                                        mdi-minus-circle
                                      </v-icon>
                                    </template>
                                    <v-list-item-title
                                      class="text-subtitle-1"
                                    >
                                      Not Applicable: {{ naCount }}
                                    </v-list-item-title>
                                  </v-list-item>
                                </v-list>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-card-text>
                    </v-card>
                  </v-window-item>
                  <!-- Tab 2: Level-specific results -->
                  <v-window-item value="1">
                    <v-card flat>
                      <v-card-text>
                        <v-table>
                          <thead>
                            <tr>
                              <th>Level</th>
                              <th>Pass</th>
                              <th>Fail</th>
                              <th>N/A</th>
                              <th>Pass Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>A</td>
                              <td>{{ levelResults.A.pass }}</td>
                              <td>{{ levelResults.A.fail }}</td>
                              <td>{{ levelResults.A.na }}</td>
                              <td>{{ levelResults.A.passRate }}%</td>
                            </tr>
                            <tr
                              v-if="
                                selectedConformanceLevel === 'AA' ||
                                  selectedConformanceLevel === 'AAA'
                              "
                            >
                              <td>AA</td>
                              <td>{{ levelResults.AA.pass }}</td>
                              <td>{{ levelResults.AA.fail }}</td>
                              <td>{{ levelResults.AA.na }}</td>
                              <td>{{ levelResults.AA.passRate }}%</td>
                            </tr>
                            <tr v-if="selectedConformanceLevel === 'AAA'">
                              <td>AAA</td>
                              <td>{{ levelResults.AAA.pass }}</td>
                              <td>{{ levelResults.AAA.fail }}</td>
                              <td>{{ levelResults.AAA.na }}</td>
                              <td>{{ levelResults.AAA.passRate }}%</td>
                            </tr>
                          </tbody>
                        </v-table>
                      </v-card-text>
                    </v-card>
                  </v-window-item>
                  <!-- Tab 3: Detailed Report -->
                  <v-window-item value="2">
                    <v-card flat>
                      <v-card-text>
                        <!-- View Options -->
                        <v-card
                          border
                          class="mb-6 pa-4"
                          elevation="1"
                        >
                          <v-card-title>View Options</v-card-title>
                          <v-card-text>
                            <v-radio-group
                              v-model="viewMode"
                              inline
                            >
                              <v-radio
                                label="All Results"
                                value="all"
                              />
                              <v-radio
                                label="One by One"
                                value="single"
                              />
                            </v-radio-group>
                          </v-card-text>
                        </v-card>
                        <!-- Download Report Button -->
                        <v-btn
                          color="success"
                          class="mb-6"
                          size="large"
                          min-width="150"
                          elevation="2"
                          @click="downloadReport"
                        >
                          <v-icon start>
                            mdi-download
                          </v-icon>
                          Download Report
                        </v-btn>
                        <!-- Detailed Report Content -->
                        <v-expansion-panels v-if="viewMode === 'single'">
                          <v-expansion-panel
                            v-for="(section, index) in detailedReport"
                            :key="index"
                          >
                            <v-expansion-panel-title
                              class="text-subtitle-1 font-weight-medium"
                            >
                              {{ section.title }}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                              <v-list>
                                <v-list-item
                                  v-for="(item, itemIndex) in section.criteria"
                                  :key="itemIndex"
                                >
                                  <v-list-item-title>
                                    {{
                                      item.text
                                    }}
                                  </v-list-item-title>
                                  <v-list-item-subtitle>
                                    Level: {{ item.level }}
                                  </v-list-item-subtitle>
                                  <v-list-item-subtitle v-if="item.notes">
                                    Notes: {{ item.notes }}
                                  </v-list-item-subtitle>
                                  <v-img
                                    v-if="item.evidence"
                                    :src="item.evidence"
                                    max-height="200"
                                    class="mt-2"
                                  />
                                  <template #append>
                                    <v-chip
                                      :color="getAnswerColor(item.answer)"
                                      size="small"
                                    >
                                      {{ getAnswerLabel(item.answer) }}
                                    </v-chip>
                                  </template>
                                </v-list-item>
                              </v-list>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                        <!-- All Results View -->
                        <div v-else>
                          <v-card
                            v-for="(section, index) in detailedReport"
                            :key="index"
                            class="mb-4"
                            border
                          >
                            <v-card-title>{{ section.title }}</v-card-title>
                            <v-card-text>
                              <v-list>
                                <v-list-item
                                  v-for="(item, itemIndex) in section.criteria"
                                  :key="itemIndex"
                                >
                                  <v-list-item-title>
                                    {{
                                      item.text
                                    }}
                                  </v-list-item-title>
                                  <v-list-item-subtitle>
                                    Level: {{ item.level }}
                                  </v-list-item-subtitle>
                                  <v-list-item-subtitle v-if="item.notes">
                                    Notes: {{ item.notes }}
                                  </v-list-item-subtitle>
                                  <v-img
                                    v-if="item.evidence"
                                    :src="item.evidence"
                                    max-height="200"
                                    class="mt-2"
                                  />
                                  <template #append>
                                    <v-chip
                                      :color="getAnswerColor(item.answer)"
                                      size="small"
                                    >
                                      {{ getAnswerLabel(item.answer) }}
                                    </v-chip>
                                  </template>
                                </v-list-item>
                              </v-list>
                            </v-card-text>
                          </v-card>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-window-item>
                </v-window>
                <!-- Action Buttons -->
                <v-row
                  class="mt-8"
                  justify="center"
                >
                  <v-col cols="auto">
                    <v-btn
                      color="primary"
                      class="ma-2"
                      size="large"
                      min-width="150"
                      elevation="2"
                      @click="restartQuiz"
                    >
                      <v-icon start>
                        mdi-refresh
                      </v-icon>
                      Start Over
                    </v-btn>
                    <v-btn
                      color="primary"
                      class="ma-2"
                      size="large"
                      min-width="150"
                      elevation="2"
                      @click="returnToSelection"
                    >
                      <v-icon start>
                        mdi-arrow-left
                      </v-icon>
                      Select Another Principle
                    </v-btn>
                    <v-btn
                      color="success"
                      class="ma-2"
                      size="large"
                      min-width="150"
                      elevation="2"
                      @click="downloadReport"
                    >
                      <v-icon start>
                        mdi-download
                      </v-icon>
                      Download Report
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import wcagData from '@/assets/WacgAxe.json';

const questions = ref([]);
const originalQuestions = ref([]);
const currentQuestionIndex = ref(0);
const currentCriterionIndex = ref(0);
const answers = ref([]);
const detailedAnswers = ref([]);
const isComplete = ref(false);
const isStarted = ref(false);
const passCount = ref(0);
const failCount = ref(0);
const naCount = ref(0);
const selectedConformanceLevel = ref('AA');
const levelResults = ref({
  A: { pass: 0, fail: 0, na: 0, passRate: 0 },
  AA: { pass: 0, fail: 0, na: 0, passRate: 0 },
  AAA: { pass: 0, fail: 0, na: 0, passRate: 0 },
});
const selectedPrinciple = ref(null);
const principles = ref([]);
const currentPrinciple = ref(null);
const currentEvidence = ref(null);
const currentNotes = ref('');
const viewMode = ref('single');
const activeTab = ref(0);

const progress = computed(() => {
  const totalQuestions = getTotalCriteriaCount();
  const answered = answers.value.length;
  return (answered / totalQuestions) * 100;
});

const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {};
});

const currentCriterion = computed(() => {
  const question = currentQuestion.value;
  if (!question.criteria || !question.criteria.length) return '';
  return question.criteria[currentCriterionIndex.value].text;
});

const currentCriterionLevel = computed(() => {
  const question = currentQuestion.value;
  if (!question.criteria || !question.criteria.length) return '';
  return question.criteria[currentCriterionIndex.value].level;
});

const totalAnswered = computed(() => {
  return passCount.value + failCount.value + naCount.value;
});

const conformanceGrade = computed(() => {
  let grade = '';
  let message = '';

  const levelA =
    levelResults.value.A.fail === 0 && levelResults.value.A.pass > 0;
  const levelAA =
    levelA &&
    levelResults.value.AA.fail === 0 &&
    levelResults.value.AA.pass > 0;
  const levelAAA =
    levelAA &&
    levelResults.value.AAA.fail === 0 &&
    levelResults.value.AAA.pass > 0;

  const principleText = currentPrinciple.value
    ? `for ${currentPrinciple.value.title} principle`
    : '';

  if (levelAAA && selectedConformanceLevel.value === 'AAA') {
    grade = 'AAA';
    message = `The website meets all Level AAA accessibility requirements that were tested ${principleText}.`;
  } else if (
    levelAA &&
    (selectedConformanceLevel.value === 'AA' ||
      selectedConformanceLevel.value === 'AAA')
  ) {
    grade = 'AA';
    message = `The website meets all Level A and AA accessibility requirements that were tested ${principleText}.`;
  } else if (levelA) {
    grade = 'A';
    message = `The website meets all Level A accessibility requirements that were tested ${principleText}.`;
  } else {
    grade = 'Not Conformant';
    message = `The website does not meet the minimum accessibility requirements ${principleText}.`;
  }

  return { grade, message };
});

const detailedReport = computed(() => {
  const report = [];
  let currentSection = null;

  detailedAnswers.value.forEach((answer) => {
    if (
      !currentSection ||
      currentSection.title !== answer.questionTitle
    ) {
      currentSection = {
        title: answer.questionTitle,
        criteria: [],
      };
      report.push(currentSection);
    }
    currentSection.criteria.push({
      text: answer.criterion,
      level: answer.level,
      answer: answer.answer,
      notes: answer.notes,
      evidence: answer.evidence,
    });
  });

  return report;
});

const initializeQuestions = () => {
  const extractedQuestions = [];
  wcagData.forEach((principle) => {
    const principleKey = Object.keys(principle)[0];
    const principleData = principle[principleKey];

    principleData.Guidelines.forEach((guideline) => {
      guideline.Rules.forEach((rule) => {
        const criteriaMapped = rule.criteria.map((criterion) => ({
          text: criterion,
          level: rule.level,
        }));

        extractedQuestions.push({
          title: `${rule.id} ${rule.title} (Level ${rule.level})`,
          description: guideline.description,
          criteria: criteriaMapped,
          principleId: principleKey,
          principleTitle: principleData.title,
        });
      });
    });
  });

  questions.value = extractedQuestions;
  originalQuestions.value = JSON.parse(JSON.stringify(extractedQuestions));
};

const startAssessment = () => {
  isStarted.value = true;
  filterQuestionsByLevel();
};

const filterQuestionsByLevel = () => {
  let filteredQuestions = JSON.parse(JSON.stringify(originalQuestions.value));

  if (currentPrinciple.value) {
    filteredQuestions = filteredQuestions.filter(
      (q) => q.principleId === currentPrinciple.value.id
    );
  }

  if (selectedConformanceLevel.value === 'A') {
    filteredQuestions = filteredQuestions.filter((q) => {
      q.criteria = q.criteria.filter((c) => c.level === 'A');
      return q.criteria.length > 0;
    });
  } else if (selectedConformanceLevel.value === 'AA') {
    filteredQuestions = filteredQuestions.filter((q) => {
      q.criteria = q.criteria.filter(
        (c) => c.level === 'A' || c.level === 'AA'
      );
      return q.criteria.length > 0;
    });
  }

  questions.value = filteredQuestions;
  currentQuestionIndex.value = 0;
  currentCriterionIndex.value = 0;
};

const getTotalCriteriaCount = () => {
  let total = 0;
  questions.value.forEach((question) => {
    total += question.criteria.length;
  });
  return total;
};

const answerQuestion = (answer) => {
  const criterionLevel = currentCriterionLevel.value;

  answers.value.push(answer);

  detailedAnswers.value.push({
    questionTitle: currentQuestion.value.title,
    criterion: currentCriterion.value,
    level: criterionLevel,
    answer: answer,
    principleId: currentQuestion.value.principleId,
    evidence: currentEvidence.value
      ? URL.createObjectURL(currentEvidence.value)
      : null,
    notes: currentNotes.value,
  });

  currentEvidence.value = null;
  currentNotes.value = '';

  if (answer === 'yes') passCount.value++;
  else if (answer === 'no') failCount.value++;
  else naCount.value++;

  if (criterionLevel === 'A') {
    if (answer === 'yes') levelResults.value.A.pass++;
    else if (answer === 'no') levelResults.value.A.fail++;
    else levelResults.value.A.na++;
  } else if (criterionLevel === 'AA') {
    if (answer === 'yes') levelResults.value.AA.pass++;
    else if (answer === 'no') levelResults.value.AA.fail++;
    else levelResults.value.AA.na++;
  } else if (criterionLevel === 'AAA') {
    if (answer === 'yes') levelResults.value.AAA.pass++;
    else if (answer === 'no') levelResults.value.AAA.fail++;
    else levelResults.value.AAA.na++;
  }

  calculatePassRates();

  if (
    currentCriterionIndex.value <
    currentQuestion.value.criteria.length - 1
  ) {
    currentCriterionIndex.value++;
  } else {
    currentCriterionIndex.value = 0;
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else {
      isComplete.value = true;
    }
  }
};

const calculatePassRates = () => {
  const calculateRate = (level) => {
    const totalApplicable = level.pass + level.fail;
    level.passRate = totalApplicable
      ? Math.round((level.pass / totalApplicable) * 100)
      : 0;
  };

  calculateRate(levelResults.value.A);
  calculateRate(levelResults.value.AA);
  calculateRate(levelResults.value.AAA);
};

const restartQuiz = () => {
  currentQuestionIndex.value = 0;
  currentCriterionIndex.value = 0;
  answers.value = [];
  detailedAnswers.value = [];
  isComplete.value = false;
  passCount.value = 0;
  failCount.value = 0;
  naCount.value = 0;
  levelResults.value = {
    A: { pass: 0, fail: 0, na: 0, passRate: 0 },
    AA: { pass: 0, fail: 0, na: 0, passRate: 0 },
    AAA: { pass: 0, fail: 0, na: 0, passRate: 0 },
  };

  filterQuestionsByLevel();
};

const returnToSelection = () => {
  isStarted.value = false;
  isComplete.value = false;
  currentPrinciple.value = null;
  restartQuiz();
};

const getAnswerLabel = (answer) => {
  switch (answer) {
    case 'yes':
      return 'Passed';
    case 'no':
      return 'Failed';
    case 'na':
      return 'Not Applicable';
    default:
      return '';
  }
};

const getAnswerColor = (answer) => {
  switch (answer) {
    case 'yes':
      return 'success';
    case 'no':
      return 'error';
    case 'na':
      return 'grey';
    default:
      return 'primary';
  }
};

const getGradeColor = (grade) => {
  switch (grade) {
    case 'AAA':
      return 'deep-purple';
    case 'AA':
      return 'green darken-1';
    case 'A':
      return 'blue';
    default:
      return 'orange darken-2';
  }
};

const downloadReport = () => {
  let reportContent = 'Web Accessibility Assessment Report\n\n';
  reportContent += `Date: ${new Date().toLocaleDateString()}\n`;
  reportContent += `Conformance Level Tested: ${selectedConformanceLevel.value}\n`;

  if (currentPrinciple.value) {
    reportContent += `Principle Tested: ${currentPrinciple.value.title}\n`;
  } else {
    reportContent += `All Principles Tested\n`;
  }

  reportContent += '\n';

  reportContent += `CONFORMANCE GRADE: ${conformanceGrade.value.grade}\n`;
  reportContent += `${conformanceGrade.value.message}\n\n`;

  reportContent += `Summary:\n`;
  reportContent += `Total Criteria Checked: ${totalAnswered.value}\n`;
  reportContent += `Passing Criteria: ${passCount.value}\n`;
  reportContent += `Failed Criteria: ${failCount.value}\n`;
  reportContent += `Not Applicable: ${naCount.value}\n\n`;

  reportContent += `Level-Specific Results:\n`;
  reportContent += `Level A: ${levelResults.value.A.pass} Pass, ${levelResults.value.A.fail} Fail, ${levelResults.value.A.na} N/A (${levelResults.value.A.passRate}% Pass Rate)\n`;

  if (
    selectedConformanceLevel.value === 'AA' ||
    selectedConformanceLevel.value === 'AAA'
  ) {
    reportContent += `Level AA: ${levelResults.value.AA.pass} Pass, ${levelResults.value.AA.fail} Fail, ${levelResults.value.AA.na} N/A (${levelResults.value.AA.passRate}% Pass Rate)\n`;
  }

  if (selectedConformanceLevel.value === 'AAA') {
    reportContent += `Level AAA: ${levelResults.value.AAA.pass} Pass, ${levelResults.value.AAA.fail} Fail, ${levelResults.value.AAA.na} N/A (${levelResults.value.AAA.passRate}% Pass Rate)\n`;
  }

  reportContent += '\nDetailed Results:\n\n';

  detailedReport.value.forEach((section) => {
    reportContent += `${section.title}\n`;
    section.criteria.forEach((item) => {
      reportContent += `- ${item.text} (Level ${item.level})\n`;
      reportContent += `  Result: ${getAnswerLabel(item.answer)}\n`;
      if (item.notes) {
        reportContent += `  Notes: ${item.notes}\n`;
      }
      if (item.evidence) {
        reportContent += `  Evidence: Screenshot attached\n`;
      }
    });
    reportContent += '\n';
  });

  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `accessibility-report${
    currentPrinciple.value ? '-' + currentPrinciple.value.title : ''
  }.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const initializePrinciples = () => {
  principles.value = wcagData.map((principle) => {
    const principleKey = Object.keys(principle)[0];
    return {
      id: principleKey,
      title: principle[principleKey].title,
      description: principle[principleKey].description,
      guidelines: principle[principleKey].Guidelines,
    };
  });
};

const selectPrinciple = (principle) => {
  currentPrinciple.value = principle;
  isStarted.value = false;
  isComplete.value = false;
  restartQuiz();
};

const selectAllPrinciples = () => {
  currentPrinciple.value = null;
  isStarted.value = false;
  isComplete.value = false;
  restartQuiz();
};

const getPrincipleIcon = (title) => {
  const icons = {
    Perceivable: 'mdi-eye',
    Operable: 'mdi-cursor-default-click',
    Understandable: 'mdi-book-open-page-variant',
    Robust: 'mdi-shield-check',
  };
  return icons[title] || 'mdi-checkbox-marked-circle';
};

const handleEvidenceUpload = (file) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const currentAnswer =
        detailedAnswers.value[detailedAnswers.value.length - 1];
      if (currentAnswer) {
        currentAnswer.evidence = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
};

onMounted(() => {
  initializeQuestions();
  initializePrinciples();
});
</script>

<style scoped>
.sidebar-card {
  height: 100%;
  border-radius: 8px;
}

.quiz-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.quiz-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.selection-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.criterion-card {
  border-radius: 8px;
  background-color: #f8f9fa;
  border-left: 4px solid var(--v-primary-base);
}

.progress-container {
  position: relative;
  margin-bottom: 16px;
}

.progress-percentage {
  position: absolute;
  right: 8px;
  top: -4px;
  font-size: 12px;
  font-weight: bold;
}

.answer-btn {
  transition: transform 0.2s;
}

.answer-btn:hover {
  transform: translateY(-2px);
}

.h-100 {
  height: 100%;
}
</style>