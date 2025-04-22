<template>
  <v-row class="ma-0">
    <!-- Sidebar -->
    <v-col cols="12" md="3" class="pa-2">
      <v-card class="sidebar-card h-100" elevation="2">
        <v-list v-model="selectedPrinciple" nav>
          <v-list-subheader class="text-h6">WCAG Principles</v-list-subheader>
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
    <v-col cols="12" md="9" class="pa-2">
      <!-- Progress bar with percentage -->
      <div v-if="!isComplete && isStarted" class="progress-container mb-3">
        <v-progress-linear
          :model-value="progress"
          color="success"
          height="12"
          class="mt-0"
        />
        <div class="progress-percentage">{{ Math.round(progress) }}%</div>
      </div>

      <!-- Current principle being tested -->
      <v-row v-if="currentPrinciple && isStarted" justify="center" class="ma-0 mb-3">
        <v-col cols="12" class="pa-0">
          <v-chip color="primary" size="large">
            <v-icon start>{{ getPrincipleIcon(currentPrinciple.title) }}</v-icon>
            Testing: {{ currentPrinciple.title }}
          </v-chip>
        </v-col>
      </v-row>

      <!-- Conformance level selection -->
      <v-row v-if="!isStarted" justify="center" class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card class="selection-card" elevation="3">
            <v-card-title class="justify-center text-h5 bg-primary text-white py-4">
              Select Conformance Level
            </v-card-title>
            <v-card-text class="pa-6">
              <p class="text-body-1 mb-5 text-grey-darken-1 text-center">
                Choose the WCAG conformance level you want to evaluate against:
              </p>
              <v-radio-group v-model="selectedConformanceLevel" class="mt-4">
                <v-radio label="Level A (Minimum level of conformance)" value="A" />
                <v-radio label="Level AA (Addresses the major barriers)" value="AA" />
                <v-radio label="Level AAA (Highest level of conformance)" value="AAA" />
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

      <v-row v-if="isStarted" justify="center" class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card class="quiz-card" elevation="3">
            <v-card-title class="justify-center text-h5 bg-primary text-white py-4">
              <span v-if="!isComplete">
                {{ currentPrinciple ? currentPrinciple.title : 'All Principles' }}
                Accessibility Assessment (Level {{ selectedConformanceLevel }})
              </span>
              <span v-else>Assessment Complete!</span>
            </v-card-title>
            <v-card-text class="pa-6">
              <!-- Quiz in progress -->
              <div v-if="!isComplete" class="quiz-content">
                <h2 class="text-h5 font-weight-bold mb-4 text-center">
                  {{ currentQuestion.title }}
                </h2>
                <p class="text-body-1 mb-5 text-grey-darken-1 text-center">
                  {{ currentQuestion.description }}
                </p>
                <v-card border class="pa-5 mb-8 criterion-card text-primary">
                  <p class="text-body-1">{{ currentCriterion }}</p>
                  <!-- Evidence Upload Section -->
                  <v-file-input
                    v-model="currentEvidence"
                    accept="image/*"
                    label="Upload Screenshot Evidence"
                    prepend-icon="mdi-camera"
                    class="mt-4"
                    @update:model-value="handleEvidenceUpload"
                  ></v-file-input>
                  <!-- Appraiser Notes -->
                  <v-textarea
                    v-model="currentNotes"
                    label="Appraiser Notes"
                    placeholder="Add your observations and notes here..."
                    rows="3"
                    class="mt-4"
                  ></v-textarea>
                </v-card>
                <div class="button-container d-flex align-center justify-center flex-wrap">
                  <v-btn
                    color="success"
                    class="ma-2 answer-btn"
                    size="large"
                    min-width="120"
                    elevation="2"
                    @click="answerQuestion('yes')"
                  >
                    <v-icon start>mdi-check</v-icon>
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
                    <v-icon start>mdi-close</v-icon>
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
                    <v-icon start>mdi-minus</v-icon>
                    N/A
                  </v-btn>
                </div>
              </div>

              <!-- Quiz results -->
              <div v-else>
                <v-tabs v-model="activeTab" bg-color="primary" color="white" grow>
                  <v-tab>
                    <v-icon start>mdi-check-circle</v-icon>
                    Conformance Assessment
                  </v-tab>
                  <v-tab>
                    <v-icon start>mdi-chart-bar</v-icon>
                    Level Results
                  </v-tab>
                  <v-tab>
                    <v-icon start>mdi-file-document</v-icon>
                    Detailed Report
                  </v-tab>
                </v-tabs>
                <v-tabs-items v-model="activeTab">
                  <!-- Tab 1: Conformance Assessment -->
                  <v-tab-item>
                    <v-card flat>
                      <v-card-text>
                        <!-- Conformance Grade -->
                        <v-card border class="mb-6 pa-4 text-center" elevation="1">
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
                        <v-card border class="mb-6 pa-4" elevation="1">
                          <v-card-text>
                            <v-row>
                              <v-col cols="12" md="6" class="text-center">
                                <v-sheet color="primary" rounded class="pa-4 mb-2">
                                  <div class="text-h3">{{ totalAnswered }}</div>
                                  <div class="text-subtitle-1">Total Criteria Checked</div>
                                </v-sheet>
                              </v-col>
                              <v-col cols="12" md="6">
                                <v-list density="compact">
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon color="success" size="28">mdi-check-circle</v-icon>
                                    </template>
                                    <v-list-item-title class="text-subtitle-1">
                                      Passing Criteria: {{ passCount }}
                                    </v-list-item-title>
                                  </v-list-item>
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon color="error" size="28">mdi-alert-circle</v-icon>
                                    </template>
                                    <v-list-item-title class="text-subtitle-1">
                                      Failed Criteria: {{ failCount }}
                                    </v-list-item-title>
                                  </v-list-item>
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon color="grey" size="28">mdi-minus-circle</v-icon>
                                    </template>
                                    <v-list-item-title class="text-subtitle-1">
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
                  </v-tab-item>
                  <!-- Tab 2: Level-specific results -->
                  <v-tab-item>
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
                            <tr v-if="selectedConformanceLevel === 'AA' || selectedConformanceLevel === 'AAA'">
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
                  </v-tab-item>
                  <!-- Tab 3: Detailed Report -->
                  <v-tab-item>
                    <v-card flat>
                      <v-card-text>
                        <!-- View Options -->
                        <v-card border class="mb-6 pa-4" elevation="1">
                          <v-card-title>View Options</v-card-title>
                          <v-card-text>
                            <v-radio-group v-model="viewMode" row>
                              <v-radio label="All Results" value="all"></v-radio>
                              <v-radio label="One by One" value="single"></v-radio>
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
                          <v-icon start>mdi-download</v-icon>
                          Download Report
                        </v-btn>
                        <!-- Detailed Report Content -->
                        <v-expansion-panels v-if="viewMode === 'single'">
                          <v-expansion-panel v-for="(section, index) in detailedReport" :key="index">
                            <v-expansion-panel-title class="text-subtitle-1 font-weight-medium">
                              {{ section.title }}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                              <v-list>
                                <v-list-item v-for="(item, itemIndex) in section.criteria" :key="itemIndex">
                                  <v-list-item-content>
                                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                                    <v-list-item-subtitle>Level: {{ item.level }}</v-list-item-subtitle>
                                    <v-list-item-subtitle v-if="item.notes">
                                      Notes: {{ item.notes }}
                                    </v-list-item-subtitle>
                                    <v-img
                                      v-if="item.evidence"
                                      :src="item.evidence"
                                      max-height="200"
                                      contain
                                      class="mt-2"
                                    ></v-img>
                                  </v-list-item-content>
                                  <v-list-item-action>
                                    <v-chip :color="getAnswerColor(item.answer)" size="small">
                                      {{ getAnswerLabel(item.answer) }}
                                    </v-chip>
                                  </v-list-item-action>
                                </v-list-item>
                              </v-list>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                        <!-- All Results View -->
                        <div v-else>
                          <v-card v-for="(section, index) in detailedReport" :key="index" class="mb-4" border>
                            <v-card-title>{{ section.title }}</v-card-title>
                            <v-card-text>
                              <v-list>
                                <v-list-item v-for="(item, itemIndex) in section.criteria" :key="itemIndex">
                                  <v-list-item-content>
                                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                                    <v-list-item-subtitle>Level: {{ item.level }}</v-list-item-subtitle>
                                    <v-list-item-subtitle v-if="item.notes">
                                      Notes: {{ item.notes }}
                                    </v-list-item-subtitle>
                                    <v-img
                                      v-if="item.evidence"
                                      :src="item.evidence"
                                      max-height="200"
                                      contain
                                      class="mt-2"
                                    ></v-img>
                                  </v-list-item-content>
                                  <v-list-item-action>
                                    <v-chip :color="getAnswerColor(item.answer)" size="small">
                                      {{ getAnswerLabel(item.answer) }}
                                    </v-chip>
                                  </v-list-item-action>
                                </v-list-item>
                              </v-list>
                            </v-card-text>
                          </v-card>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
                <!-- Action Buttons -->
                <v-row class="mt-8" justify="center">
                  <v-col cols="auto">
                    <v-btn
                      color="primary"
                      class="ma-2"
                      size="large"
                      min-width="150"
                      elevation="2"
                      @click="restartQuiz"
                    >
                      <v-icon start>mdi-refresh</v-icon>
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
                      <v-icon start>mdi-arrow-left</v-icon>
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
                      <v-icon start>mdi-download</v-icon>
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

<script>
import wcagData from '@/assets/WacgAxe.json'

export default {
  name: 'AccessibilityQuiz',
  data() {
    return {
      questions: [],
      originalQuestions: [], // Store original questions for filtering
      currentQuestionIndex: 0,
      currentCriterionIndex: 0,
      answers: [],
      detailedAnswers: [],
      isComplete: false,
      isStarted: false,
      passCount: 0,
      failCount: 0,
      naCount: 0,
      selectedConformanceLevel: 'AA', // Default to AA
      levelResults: {
        A: { pass: 0, fail: 0, na: 0, passRate: 0 },
        AA: { pass: 0, fail: 0, na: 0, passRate: 0 },
        AAA: { pass: 0, fail: 0, na: 0, passRate: 0 },
      },
      selectedPrinciple: null,
      principles: [],
      currentPrinciple: null,
      principleTest: null, // To track if we're testing a specific principle
      currentEvidence: null,
      currentNotes: '',
      viewMode: 'single',
      activeTab: 0,
    }
  },
  computed: {
    progress() {
      const totalQuestions = this.getTotalCriteriaCount()
      const answered = this.answers.length
      return (answered / totalQuestions) * 100
    },
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || {}
    },
    currentCriterion() {
      const question = this.currentQuestion
      if (!question.criteria || !question.criteria.length) return ''
      return question.criteria[this.currentCriterionIndex].text
    },
    currentCriterionLevel() {
      const question = this.currentQuestion
      if (!question.criteria || !question.criteria.length) return ''
      return question.criteria[this.currentCriterionIndex].level
    },
    totalAnswered() {
      return this.passCount + this.failCount + this.naCount
    },
    conformanceGrade() {
      // Calculate grade based on pass rates at each level
      let grade = ''
      let message = ''

      // Calculate if they pass level A, AA, or AAA
      const levelA =
        this.levelResults.A.fail === 0 && this.levelResults.A.pass > 0
      const levelAA =
        levelA &&
        this.levelResults.AA.fail === 0 &&
        this.levelResults.AA.pass > 0
      const levelAAA =
        levelAA &&
        this.levelResults.AAA.fail === 0 &&
        this.levelResults.AAA.pass > 0

      const principleText = this.currentPrinciple
        ? `for ${this.currentPrinciple.title} principle`
        : ''

      if (levelAAA && this.selectedConformanceLevel === 'AAA') {
        grade = 'AAA'
        message = `The website meets all Level AAA accessibility requirements that were tested ${principleText}.`
      } else if (
        levelAA &&
        (this.selectedConformanceLevel === 'AA' ||
          this.selectedConformanceLevel === 'AAA')
      ) {
        grade = 'AA'
        message = `The website meets all Level A and AA accessibility requirements that were tested ${principleText}.`
      } else if (levelA) {
        grade = 'A'
        message = `The website meets all Level A accessibility requirements that were tested ${principleText}.`
      } else {
        grade = 'Not Conformant'
        message = `The website does not meet the minimum accessibility requirements ${principleText}.`
      }

      return { grade, message }
    },
    detailedReport() {
      // Group answers by question
      const report = []
      let currentSection = null

      this.detailedAnswers.forEach((answer) => {
        if (!currentSection || currentSection.title !== answer.questionTitle) {
          currentSection = {
            title: answer.questionTitle,
            criteria: [],
          }
          report.push(currentSection)
        }
        currentSection.criteria.push({
          text: answer.criterion,
          level: answer.level,
          answer: answer.answer,
          notes: answer.notes,
          evidence: answer.evidence,
        })
      })

      return report
    },
  },
  created() {
    this.initializeQuestions()
    this.initializePrinciples()
  },
  methods: {
    initializeQuestions() {
      // Flatten the WCAG data structure into a more manageable format
      const extractedQuestions = []
      wcagData.forEach((principle) => {
        const principleKey = Object.keys(principle)[0]
        const principleData = principle[principleKey]

        principleData.Guidelines.forEach((guideline) => {
          guideline.Rules.forEach((rule) => {
            const criteriaMapped = rule.criteria.map((criterion) => ({
              text: criterion,
              level: rule.level, // Add the level to each criterion
            }))

            extractedQuestions.push({
              title: `${rule.id} ${rule.title} (Level ${rule.level})`,
              description: guideline.description,
              criteria: criteriaMapped,
              principleId: principleKey, // Add principle ID for filtering
              principleTitle: principleData.title,
            })
          })
        })
      })

      this.questions = extractedQuestions
      this.originalQuestions = JSON.parse(JSON.stringify(extractedQuestions)) // Deep copy
    },
    startAssessment() {
      this.isStarted = true
      this.filterQuestionsByLevel()
    },
    filterQuestionsByLevel() {
      // Start with all questions or filtered by principle
      let filteredQuestions = JSON.parse(JSON.stringify(this.originalQuestions))

      // Filter by principle if one is selected
      if (this.currentPrinciple) {
        filteredQuestions = filteredQuestions.filter(
          (q) => q.principleId === this.currentPrinciple.id,
        )
      }

      // Filter by conformance level
      if (this.selectedConformanceLevel === 'A') {
        filteredQuestions = filteredQuestions.filter((q) => {
          q.criteria = q.criteria.filter((c) => c.level === 'A')
          return q.criteria.length > 0
        })
      } else if (this.selectedConformanceLevel === 'AA') {
        filteredQuestions = filteredQuestions.filter((q) => {
          q.criteria = q.criteria.filter(
            (c) => c.level === 'A' || c.level === 'AA',
          )
          return q.criteria.length > 0
        })
      }
      // For AAA, include all levels

      this.questions = filteredQuestions
      this.currentQuestionIndex = 0
      this.currentCriterionIndex = 0
    },
    getTotalCriteriaCount() {
      let total = 0
      this.questions.forEach((question) => {
        total += question.criteria.length
      })
      return total
    },
    answerQuestion(answer) {
      const criterionLevel = this.currentCriterionLevel

      this.answers.push(answer)

      // Store detailed answer with evidence and notes
      this.detailedAnswers.push({
        questionTitle: this.currentQuestion.title,
        criterion: this.currentCriterion,
        level: criterionLevel,
        answer: answer,
        principleId: this.currentQuestion.principleId,
        evidence: this.currentEvidence ? URL.createObjectURL(this.currentEvidence) : null,
        notes: this.currentNotes,
      })

      // Reset evidence and notes for next question
      this.currentEvidence = null
      this.currentNotes = ''

      // Update overall counts
      if (answer === 'yes') this.passCount++
      else if (answer === 'no') this.failCount++
      else this.naCount++

      // Update level-specific counts
      if (criterionLevel === 'A') {
        if (answer === 'yes') this.levelResults.A.pass++
        else if (answer === 'no') this.levelResults.A.fail++
        else this.levelResults.A.na++
      } else if (criterionLevel === 'AA') {
        if (answer === 'yes') this.levelResults.AA.pass++
        else if (answer === 'no') this.levelResults.AA.fail++
        else this.levelResults.AA.na++
      } else if (criterionLevel === 'AAA') {
        if (answer === 'yes') this.levelResults.AAA.pass++
        else if (answer === 'no') this.levelResults.AAA.fail++
        else this.levelResults.AAA.na++
      }

      // Calculate pass rates for each level
      this.calculatePassRates()

      // Move to next criterion or question
      if (
        this.currentCriterionIndex <
        this.currentQuestion.criteria.length - 1
      ) {
        this.currentCriterionIndex++
      } else {
        this.currentCriterionIndex = 0
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++
        } else {
          this.isComplete = true
        }
      }
    },
    calculatePassRates() {
      const calculateRate = (level) => {
        const totalApplicable = level.pass + level.fail
        level.passRate = totalApplicable
          ? Math.round((level.pass / totalApplicable) * 100)
          : 0
      }

      calculateRate(this.levelResults.A)
      calculateRate(this.levelResults.AA)
      calculateRate(this.levelResults.AAA)
    },
    restartQuiz() {
      this.currentQuestionIndex = 0
      this.currentCriterionIndex = 0
      this.answers = []
      this.detailedAnswers = []
      this.isComplete = false
      this.passCount = 0
      this.failCount = 0
      this.naCount = 0
      this.levelResults = {
        A: { pass: 0, fail: 0, na: 0, passRate: 0 },
        AA: { pass: 0, fail: 0, na: 0, passRate: 0 },
        AAA: { pass: 0, fail: 0, na: 0, passRate: 0 },
      }

      // Re-filter questions based on current principle and level
      this.filterQuestionsByLevel()
    },
    returnToSelection() {
      this.isStarted = false
      this.isComplete = false
      this.currentPrinciple = null
      this.restartQuiz()
    },
    getAnswerLabel(answer) {
      switch (answer) {
        case 'yes':
          return 'Passed'
        case 'no':
          return 'Failed'
        case 'na':
          return 'Not Applicable'
        default:
          return ''
      }
    },
    getAnswerColor(answer) {
      switch (answer) {
        case 'yes':
          return 'success'
        case 'no':
          return 'error'
        case 'na':
          return 'grey'
        default:
          return 'primary'
      }
    },
    getGradeColor(grade) {
      switch (grade) {
        case 'AAA':
          return 'deep-purple'
        case 'AA':
          return 'green darken-1'
        case 'A':
          return 'blue'
        default:
          return 'orange darken-2'
      }
    },
    downloadReport() {
      // Create report content
      let reportContent = 'Web Accessibility Assessment Report\n\n'
      reportContent += `Date: ${new Date().toLocaleDateString()}\n`
      reportContent += `Conformance Level Tested: ${this.selectedConformanceLevel}\n`

      if (this.currentPrinciple) {
        reportContent += `Principle Tested: ${this.currentPrinciple.title}\n`
      } else {
        reportContent += `All Principles Tested\n`
      }

      reportContent += '\n'

      // Add conformance grade
      reportContent += `CONFORMANCE GRADE: ${this.conformanceGrade.grade}\n`
      reportContent += `${this.conformanceGrade.message}\n\n`

      reportContent += `Summary:\n`
      reportContent += `Total Criteria Checked: ${this.totalAnswered}\n`
      reportContent += `Passing Criteria: ${this.passCount}\n`
      reportContent += `Failed Criteria: ${this.failCount}\n`
      reportContent += `Not Applicable: ${this.naCount}\n\n`

      // Add level-specific results
      reportContent += `Level-Specific Results:\n`
      reportContent += `Level A: ${this.levelResults.A.pass} Pass, ${this.levelResults.A.fail} Fail, ${this.levelResults.A.na} N/A (${this.levelResults.A.passRate}% Pass Rate)\n`

      if (
        this.selectedConformanceLevel === 'AA' ||
        this.selectedConformanceLevel === 'AAA'
      ) {
        reportContent += `Level AA: ${this.levelResults.AA.pass} Pass, ${this.levelResults.AA.fail} Fail, ${this.levelResults.AA.na} N/A (${this.levelResults.AA.passRate}% Pass Rate)\n`
      }

      if (this.selectedConformanceLevel === 'AAA') {
        reportContent += `Level AAA: ${this.levelResults.AAA.pass} Pass, ${this.levelResults.AAA.fail} Fail, ${this.levelResults.AAA.na} N/A (${this.levelResults.AAA.passRate}% Pass Rate)\n`
      }

      reportContent += '\nDetailed Results:\n\n'

      this.detailedReport.forEach((section) => {
        reportContent += `${section.title}\n`
        section.criteria.forEach((item) => {
          reportContent += `- ${item.text} (Level ${item.level})\n`
          reportContent += `  Result: ${this.getAnswerLabel(item.answer)}\n`
          if (item.notes) {
            reportContent += `  Notes: ${item.notes}\n`
          }
          if (item.evidence) {
            reportContent += `  Evidence: Screenshot attached\n`
          }
        })
        reportContent += '\n'
      })

      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `accessibility-report${
        this.currentPrinciple ? '-' + this.currentPrinciple.title : ''
      }.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    initializePrinciples() {
      this.principles = wcagData.map((principle) => {
        const principleKey = Object.keys(principle)[0]
        return {
          id: principleKey,
          title: principle[principleKey].title,
          description: principle[principleKey].description,
          guidelines: principle[principleKey].Guidelines,
        }
      })
    },
    selectPrinciple(principle) {
      this.currentPrinciple = principle
      this.isStarted = false
      this.isComplete = false
      this.restartQuiz()
    },
    selectAllPrinciples() {
      this.currentPrinciple = null
      this.isStarted = false
      this.isComplete = false
      this.restartQuiz()
    },
    getPrincipleIcon(title) {
      const icons = {
        Perceivable: 'mdi-eye',
        Operable: 'mdi-cursor-default-click',
        Understandable: 'mdi-book-open-page-variant',
        Robust: 'mdi-shield-check',
      }
      return icons[title] || 'mdi-checkbox-marked-circle'
    },
    handleEvidenceUpload(file) {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const currentAnswer = this.detailedAnswers[this.detailedAnswers.length - 1]
          if (currentAnswer) {
            currentAnswer.evidence = e.target.result
          }
        }
        reader.readAsDataURL(file)
      }
    },
  },
}
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
