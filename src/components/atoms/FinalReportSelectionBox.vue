<template>
  <div class="selection-box">
    <h2>SELECT YOUR PDF ELEMENTS</h2>
    <div class="flex-container">
      <div class="column with-border" style="max-height: 28vh;">
        <input
          type="range"
          v-model="sliderValue"
          :min="0"
          :max="Math.max(0, heuristics.length - 5)"
          step="5"
          class="heuristics-slider"
        />
        <div class="slidder-section">
          <div class="heuristics-slider-label">
            Heuristics {{ sliderValueMin }} to {{ sliderValueMax }}
          </div>
        </div>
        <div
          v-if="showSlider"
          class="slider-container"
          style="overflow: scroll;max-height: 90%;"
        >
          <div
            v-for="heuristic in visibleHeuristics"
            :key="heuristic.id"
            class="option"
          >
            <input
              type="checkbox"
              :id="'heuristic' + heuristic.id"
              :name="heuristic.name"
              v-model="selectedHeuristics"
              :value="heuristic.id"
            />
            <label :for="'heuristic' + heuristic.id">
              {{ heuristic.id }} - {{ heuristic.title }}
            </label>
          </div>
        </div>
        <div v-else>
          Heuristics:
          <div
            v-for="heuristic in heuristics"
            :key="heuristic.id"
            class="option"
          >
            <input
              type="checkbox"
              :id="'heuristic' + heuristic.id"
              :name="heuristic.name"
            />

            <label :for="'heuristic' + heuristic.id">
              {{ heuristic.id }} - {{ heuristic.title }}
            </label>
          </div>
        </div>
      </div>

      <div class="column with-margin">
        <div v-for="option in options" :key="option.id" class="option">
          <input type="checkbox" :id="option.id" :name="option.name" />
          <label class="option" :for="option.id">{{ option.label }}</label>
        </div>
      </div>
      <v-btn @click="submitPdf" :disabled="isLoading" class="bottom-button">
        <span v-if="!isLoading">Generate PDF</span>
        <span v-else>Loading...</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { finalResult, statistics } from '@/utils/statistics'

export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({
    preview: new Object(),
    formattedDate: '',
    statistics: '',
    currentHeuristicIndex: 0,
    showSlider: false,
    sliderValue: 0,
    isLoading: false, // New data property to track loading state
    selectedHeuristics: [],
    cooperatorsEmail: [],
  }),
  mounted() {
    window.addEventListener('resize', this.checkHeuristicsSlider)
    this.checkHeuristicsSlider()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkHeuristicsSlider)
  },
  computed: {
    sliderValueMin() {
      return Number(this.sliderValue) + 1
    },
    sliderValueMax() {
      return Math.min(Number(this.sliderValue) + 5, this.heuristics.length)
    },
    visibleHeuristics() {
      return this.heuristics.slice(
        Number(this.sliderValue),
        Number(this.sliderValue) + 5,
      )
    },
    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
    answers() {
      if (this.testAnswerDocument) {
        return this.testAnswerDocument.type === 'HEURISTICS'
          ? Object.values(this.testAnswerDocument.heuristicAnswers)
          : Object.values(this.testAnswerDocument.taskAnswers)
      }
      return []
    },
    test() {
      return this.$store.getters.test
    },
    heuristics() {
      return this.test.testStructure
    },
    options() {
      return [
        { id: 'options', name: 'options', label: 'Test options' },
        { id: 'comments', name: 'comments', label: 'Answers comments' },
        { id: 'results', name: 'results', label: 'Statistics' },
        {
          id: 'evaluators-results',
          name: 'evaluators-results',
          label: 'Answers by evaluators',
        },
        {
          id: 'heuristics-results',
          name: 'heuristics-results',
          label: 'Answers by heuristics',
        },
        { id: 'finalReport', name: 'finalReport', label: 'Final Report' },
      ]
    },
  },
  methods: {
    heuristicsEvaluator() {
      let table = {
        header: [],
        items: [],
      }

      // Your existing data
      let testOptions = this.test.testOptions // Provide your testOptions array here
      let resultEvaluator = statistics() // Provide your resultEvaluator array here

      // Code to calculate max and min values
      let options = testOptions.map((op) => op.value)
      let max = Math.max(...options)
      let min = Math.min(...options)

      // Add "HEURISTICS" to the table header
      table.header.push({
        text: 'HEURISTICS',
        value: 'heuristic',
      })

      // Process each evaluator in resultEvaluator
      if (resultEvaluator) {
        resultEvaluator.forEach((evaluator) => {
          let header = table.header.find((h) => h.text === evaluator.id)
          if (!header) {
            table.header.push({
              text: evaluator.id,
              value: evaluator.id,
            })
          }
          evaluator.heuristics.forEach((heuristic) => {
            let item = table.items.find((i) => i.heuristic === heuristic.id)
            if (item) {
              Object.assign(item, {
                [evaluator.id]: heuristic.result,
              })
            } else {
              table.items.push({
                heuristic: heuristic.id,
                max: max * heuristic.totalQuestions,
                min: min * heuristic.totalQuestions,
                [evaluator.id]: heuristic.result,
              })
            }
          })
        })
      }

      return table
    },

    checkHeuristicsSlider() {
      const containerWidth = this.$el.querySelector('.column').offsetWidth
      const heuristicWidth = 200
      const numVisibleHeuristics = Math.floor(containerWidth / heuristicWidth)
      this.showSlider = this.heuristics.length > numVisibleHeuristics + 5
    },

    async genPreview() {
      let options = document.getElementById('options')
      let comments = document.getElementById('comments')
      let results = document.getElementById('results')
      let finalReport = document.getElementById('finalReport')
      let evaluatorsResults = document.getElementById('evaluators-results')
      let heuristicsResults = document.getElementById('heuristics-results')

      //test options
      if (options.checked == true) {
        this.preview.testOptions = this.test.testOptions
      } else this.preview.testOptions = '' //end of test options

      //test comments
      if (comments.checked == true) {
        this.preview.testComments = true
      } else this.preview.testComments = false //end of test comments

      //test statistics
      if (results.checked == true) {
        let answersDocId = this.test.answersDocId
        this.preview.results = answersDocId
      } else this.preview.results = '' //end of test statistics

      //Statistics
      if (evaluatorsResults.checked == true) {
        this.preview.statistics = true
      } else this.preview.statistics = false //end of test statistics

      if (heuristicsResults.checked == true) {
        this.preview.heuristicEvaluator = this.heuristicsEvaluator()
      } else this.preview.heuristicEvaluator = '' //end of test statistics

      if (finalReport.checked) {
        this.preview.finalReport = this.test.finalReport //
      }
    },

    finalResult,

    async submitPdf() {
      console.log(this.preview.heuristicEvaluator)
      this.isLoading = true // Set isLoading to true to indicate PDF generation is in progress
      console.log(this.selectedHeuristics)
      try {
        await this.genPreview()
        const date = new Date() // Get current date
        const dayOfMonth = date.getDate() // Get day of the month
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]
        const monthName = monthNames[date.getMonth()] // Get month name
        const year = date.getFullYear() // Get year

        // Add ordinal suffix to day of month (e.g. 1st, 2nd, 3rd)
        let dayOfMonthStr
        switch (dayOfMonth) {
          case 1:
          case 21:
          case 31:
            dayOfMonthStr = dayOfMonth + 'st'
            break
          case 2:
          case 22:
            dayOfMonthStr = dayOfMonth + 'nd'
            break
          case 3:
          case 23:
            dayOfMonthStr = dayOfMonth + 'rd'
            break
          default:
            dayOfMonthStr = dayOfMonth + 'th'
        }

        this.formattedDate = `${dayOfMonthStr} ${monthName}, ${year}`
        this.statistics = finalResult()
        console.log(this.test)

        this.test.cooperators.forEach((element) => {
          console.log(element)
          this.cooperatorsEmail.push(element.email) // Use push to add emails to the array
        })
        console.log(this.cooperatorsEmail)
        this.preview.cooperatorsEmail = this.cooperatorsEmail
        this.cooperatorsEmail = []
        console.log(this.preview)
        //this.preview.cooperatorsEmail = this.test.cooperators[i].email
        await axios
          .post(
            'http://localhost:8000/api/endpoint',
            {
              items: [
                {
                  title: this.test.testTitle, //---------------basic pdf elements section  |
                  date: this.formattedDate,
                  creationDate: this.test.creationDate,
                  testDescription: this.test.testDescription,
                  cooperatorsEmail: this.preview.cooperatorsEmail,
                  creatorEmail: this.test.testAdmin.email, //-------------------------------|

                  finalReport: this.preview.finalReport, //
                  allOptions: this.preview.testOptions, //

                  allAnswers: this.answers,
                  testStructure: this.test.testStructure,
                  selectedHeuristics: this.selectedHeuristics,

                  statistics: this.preview.statistics,
                  gstatistics: this.statistics,
                  statisticstable: this.$store.state.Answer.evaluatorStatistics,
                  heuristicStatistics: this.preview.heuristicEvaluator,

                  testComments: this.preview.testComments,
                },
              ],
            },
            { responseType: 'blob' },
          )
          .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'heuristic-test.pdf')
            document.body.appendChild(link)
            link.click()
          })
          .catch((error) => {
            console.error(error)
          })
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoading = false // Set isLoading back to false after the PDF generation is complete or encountered an error.
      }
    },
  },
}
</script>

<style>
.selection-box {
  margin-left: 0px;
  padding: 1rem;
  border-radius: 36px 0px 0 0;
}

.flex-container {
  display: flex;
  flex-wrap: wrap; /* Allow items to wrap to new lines */
  gap: 1rem; /* Add some space between items */
}

.column {
  flex: 1;
}

.option {
  font-size: medium;
  padding: 0.5rem;
}
.bottom-button {
  align-self: flex-end;
  margin-top: 1rem; /* Add space at the top */
  margin-bottom: 1rem;
}

/* Larger screens */
@media (min-width: 768px) {
  .flex-container {
    flex-direction: row; /* Horizontal layout for larger screens */
  }

  .column {
    flex: 0.5; /* Each column takes half of the available width */
    max-width: 50%; /* Limit column width to 50% */
  }

  .slidder-section {
    align-items: center;
    margin: 0; /* Reset margin for this section */
  }

  .heuristics-slider-label {
    font-size: medium;
    margin-left: 0.5rem;
  }

  .heuristics-slider {
    max-width: 15vw;
    margin: 0 0.5rem;
  }
}

/* Smaller screens */
@media (max-width: 767px) {
  .flex-container {
    flex-direction: column; /* Vertical layout for smaller screens */
  }

  .column {
    flex: none; /* Reset flex property to allow natural width */
    max-width: 100%; /* Allow column to take full width */
  }

  .column.with-border {
    order: 0; /* Move this column below the other column on small screens */
  }

  /* Adjust the height and overflow of the slider container */
  .slider-container {
    max-height: 20vh !important; /* Adjust the height as needed */
    overflow-y: auto !important; /* Enable vertical scrolling */
    overflow-x: hidden !important; /* Hide horizontal scrolling */
    margin-top: 1rem; /* Add space at the top */
    font-size: 10px;

    background-color: #ebebeb;
    border-radius: 12px;
    padding: 0.25rem;
  }

  .bottom-button {
    align-self: flex-start !important;
    margin-top: 1rem; /* Add space at the top */
    margin-bottom: 1rem;
  }
}
</style>
