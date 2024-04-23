<template>
  <div class="selection-box mt-0 py-0">
    <h2>{{ $t('pages.finalReport.select') }}</h2>
    <div class="flex-container pt-2">
      <div
        v-if="heuristics.length !== 0"
        class="column with-border"
        style="max-height: 28vh"
      >
        {{ $t('pages.finalReport.heuristic') + 's:' }}

        <div v-if="showSlider" class="pb-4 mt-1 overflow-container">
          <div
            v-for="heuristic in visibleHeuristics"
            :key="heuristic.id"
            class="option"
          >
            <input :id="'heuristic' + heuristic.id" v-model="selectedHeuristics" type="checkbox" :name="heuristic.name" :value="heuristic.id" />
            <label :for="'heuristic' + heuristic.id">
              {{ heuristic.id + 1 }} - {{ heuristic.title }}
            </label>
          </div>
        </div>
        <div v-else>
          {{ $t('pages.finalReport.heuristic') + 's:' }}
          <div
            v-for="heuristic in heuristics"
            :key="heuristic.id"
            class="option"
          >
            <input
              :id="'heuristic' + heuristic.id"
              type="checkbox"
              :name="heuristic.name"
            />

            <label :for="'heuristic' + heuristic.id">
              {{ heuristic.id }} - {{ heuristic.title }}
            </label>
          </div>
        </div>
      </div>

      <div v-else class="column with-border" style="max-height: 28vh">
        <div style="margin-top: 10%">
          {{ $t('pages.finalReport.createHeuristics') }}
        </div>
      </div>

      <div class="column with-margin ">
        {{ $t('pages.finalReport.elements') + ':' }}
        <div v-for="option in options" :key="option.id" class="option">
          <input :id="option.id" type="checkbox" :name="option.name" />
          <label class="option" :for="option.id">{{ option.label }}</label>
        </div>
      </div>
    </div>
    <div class="mt-12" align="right">
      <v-btn
        :disabled="isLoading"
        class=""
        dark
        color="orange"
        @click="submitPdf"
      >
        <span v-if="!isLoading">{{ $t('pages.finalReport.pdf') }}</span>
        <span v-else>{{ $t('pages.finalReport.options.loading') }}</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { finalResult, statistics } from '@/utils/statistics'
import i18n from '@/i18n'

export default {
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
  computed: {
    sliderValueMin() {
      return Number(this.sliderValue) + 1
    },
    sliderValueMax() {
      return Math.min(Number(this.sliderValue) + 5, this.heuristics.length)
    },
    visibleHeuristics() {
      return this.heuristics.slice(Number(this.sliderValue))
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
        {
          id: 'options',
          name: 'options',
          label: i18n.t('pages.finalReport.options.options'),
        },
        {
          id: 'comments',
          name: 'comments',
          label: i18n.t('pages.finalReport.options.comments'),
        },
        {
          id: 'results',
          name: 'results',
          label: i18n.t('pages.finalReport.options.statistics'),
        },
        {
          id: 'evaluators-results',
          name: 'evaluators-results',
          label: i18n.t('pages.finalReport.options.answersByEvaluator'),
        },
        {
          id: 'heuristics-results',
          name: 'heuristics-results',
          label: i18n.t('pages.finalReport.options.answersByHeuristics'),
        },
        {
          id: 'finalReport',
          name: 'finalReport',
          label: i18n.t('pages.finalReport.options.finalReport'),
        },
      ]
    },
  },
  mounted() {
    window.addEventListener('resize', this.checkHeuristicsSlider)
    this.checkHeuristicsSlider()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkHeuristicsSlider)
  },
  methods: {
    heuristicsEvaluator() {
      const table = {
        header: [],
        items: [],
      }

      // Your existing data
      const testOptions = this.test.testOptions // Provide your testOptions array here
      const resultEvaluator = statistics() // Provide your resultEvaluator array here

      // Code to calculate max and min values
      const options = testOptions.map((op) => op.value)
      const max = Math.max(...options)
      const min = Math.min(...options)

      // Add "HEURISTICS" to the table header
      table.header.push({
        text: 'HEURISTICS',
        value: 'heuristic',
      })

      // Process each evaluator in resultEvaluator
      if (resultEvaluator) {
        resultEvaluator.forEach((evaluator) => {
          const header = table.header.find((h) => h.text === evaluator.id)
          if (!header) {
            table.header.push({
              text: evaluator.id,
              value: evaluator.id,
            })
          }
          evaluator.heuristics.forEach((heuristic) => {
            const item = table.items.find((i) => i.heuristic === heuristic.id)
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
      this.showSlider = this.heuristics.length
    },

    async genPreview() {
      const options = document.getElementById('options')
      const comments = document.getElementById('comments')
      const results = document.getElementById('results')
      const finalReport = document.getElementById('finalReport')
      const evaluatorsResults = document.getElementById('evaluators-results')
      const heuristicsResults = document.getElementById('heuristics-results')

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
        const answersDocId = this.test.answersDocId
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
      this.isLoading = true // Set isLoading to true to indicate PDF generation is in progress

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

        if (this.test.cooperators && Array.isArray(this.test.cooperators)) {
          if (this.test.cooperators.length > 0) {
            this.test.cooperators.forEach((element) => {
              if (element && element.email) {
                this.cooperatorsEmail.push(element.email) // Extract and push emails to the array
              }
            })

            // Assign the extracted email addresses to the preview object
            this.preview.cooperatorsEmail = this.cooperatorsEmail

            // Reset the cooperatorsEmail array to an empty array
            this.cooperatorsEmail = []
          } else {
            console.log('cooperators email not empty')
          }
        } else {
          this.preview.cooperatorsEmail = ''
        }
        //this.preview.cooperatorsEmail = this.test.cooperators[i].email
        await axios
          .post(
            process.env.LARAVEL_PDF,
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
  flex-wrap: wrap;
  /* Allow items to wrap to new lines */
  gap: 1rem;
  /* Add some space between items */
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
  margin-top: 1rem;
  /* Add space at the top */
  margin-bottom: 1rem;
}

.overflow-container {
  overflow-x: hidden; /* Impede a rolagem horizontal */
  overflow-y: auto; /* Habilita a rolagem vertical se necessário */
  max-height: 150%; /* Define a altura máxima */
}

/* Larger screens */
@media (min-width: 768px) {
  .flex-container {
    flex-direction: row;
    /* Horizontal layout for larger screens */
  }

  .column {
    flex: 0.5;
    /* Each column takes half of the available width */
    max-width: 50%;
    /* Limit column width to 50% */
  }

  .slidder-section {
    align-items: center;
    margin: 0;
    /* Reset margin for this section */
  }

  .heuristics-slider-label {
    font-size: medium;
    margin-left: 0.5rem;
    margin: 1rem;
  }

  .heuristics-slider {
    max-width: 15vw;
    margin: 0 0.5rem;
  }
}

/* Smaller screens */
@media (max-width: 767px) {
  .flex-container {
    flex-direction: column;
    /* Vertical layout for smaller screens */
  }

  .column {
    flex: none;
    /* Reset flex property to allow natural width */
    max-width: 100%;
    /* Allow column to take full width */
  }

  .column.with-border {
    order: 0;
    /* Move this column below the other column on small screens */
  }

  /* Adjust the height and overflow of the slider container */
  .slider-container {
    max-height: 20vh !important;
    /* Adjust the height as needed */
    overflow-y: auto !important;
    /* Enable vertical scrolling */
    overflow-x: hidden !important;
    /* Hide horizontal scrolling */
    margin-top: 1rem;
    /* Add space at the top */
    font-size: 10px;

    background-color: #ebebeb;
    border-radius: 12px;
    padding: 0.25rem;
  }

  .bottom-button {
    align-self: flex-start !important;
    margin-top: 1rem;
    /* Add space at the top */
    margin-bottom: 1rem;
  }
}
</style>
