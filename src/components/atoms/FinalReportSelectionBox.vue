<template>
  <div class="selection-box">
    <h2>SELECT YOUR PDF ELEMENTS</h2>
    <div class="flex-container">
      <div class="column with-border">
        <div v-if="showSlider" class="slider-container">
          <div class="slidder-section">
            <input
              type="range"
              v-model="sliderValue"
              :min="0"
              :max="Math.max(0, heuristics.length - 5)"
              step="1"
              class="heuristics-slider"
            />
            <div class="heuristics-slider-label">
              Heuristics {{ sliderValueMin }} to {{ sliderValueMax }}
            </div>
          </div>
          <div
            v-for="heuristic in visibleHeuristics"
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
    </div>

    <v-btn @click="submitPdf">Generate PDF</v-btn>
  </div>
</template>

<script>
import axios from 'axios'
import { finalResult } from '@/utils/statistics'

export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({
    preview: new Object(),
    formattedDate: '',
    statistics: '',
    currentHeuristicIndex: 0,
    showSlider: false,
    sliderValue: 0,
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
    checkHeuristicsSlider() {
      const containerWidth = this.$el.querySelector('.column').offsetWidth
      const heuristicWidth = 200 // Adjust this value based on your needs
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

      for (let i = 0; i <= this.test.testStructure.length; i++) {
        let auxId = document.getElementById('heuristic' + i)

        console.log(auxId)
      }
      //test options
      if (options.checked == true) {
        this.preview.testOptions = this.test.testOptions
      } else this.preview.testOptions = '' //end of test options

      //test comments
      if (comments.checked == true) {
        this.preview.testComments = this.test.answersDocId
      } else this.preview.testComments = '' //end of test comments

      //test statistics
      if (results.checked == true) {
        let answersDocId = this.test.answersDocId
        console.log(this.$store.getters.testAnswerDocument)
        //need to get only the results + graphics, not the answersDocId
        this.preview.results = answersDocId
      } else this.preview.results = '' //end of test statistics

      //Evaluators results
      if (evaluatorsResults.checked == true) {
        console.log(this.$store.getters.testAnswerDocument)
      } //end of test statistics

      if (heuristicsResults.checked == true) {
        console.log(this.$store.getters.testAnswerDocument)
      } //end of test statistics
      if (finalReport.checked) {
        this.preview.finalReport = this.test.finalReport //
      }
    },

    finalResult,

    async submitPdf() {
      console.log(this.test.testStructure)
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
      console.log(this.test.testDescription)
      axios
        .post(
          'http://localhost:8000/api/endpoint',
          {
            items: [
              {
                title: this.test.testTitle, //---------------basic pdf elements section  |
                date: this.formattedDate, //                                             |
                creationDate: this.test.creationDate, //                                 |
                testDescription: this.test.testDescription, //                            |
                creatorEmail: this.test.testAdmin.email, //-------------------------------|

                finalReport: this.preview.finalReport, //
                allOptions: this.preview.testOptions, //

                allAnswers: this.answers,
                testStructure: this.test.testStructure,
                gstatistics: this.statistics,
                statisticstable: this.$store.state.Answer.evaluatorStatistics,
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
          console.log(response)
        })
        .catch((error) => {
          console.error(error)
        })
    },
  },
}
</script>

<style>
.slider-container {
  display: flex;
  flex-direction: column;
  align-items: left;
}
.slidder-section {
  display: flex; /* Display the slider and label side by side */
  align-items: center; /* Align items vertically at the center */
  margin: 1rem 0; /* Add margin to create space between sections */
}

.heuristics-slider-label {
  font-size: medium;
  margin-left: 1rem; /* Add margin to create space between slider and label */
}

.heuristics-slider {
  max-width: 10vw;
  margin: 0 1rem; /* Add margin to create space between slider and other elements */
}

.with-border {
  border-right: 1px solid #ccc; /* Adjust the color and width as needed */
}

.with-margin {
  margin-left: 1rem;
}
.selection-box {
  margin-left: 0px;
  padding: 1rem;
  border-radius: 36px 0px 0 0;
}

.flex-container {
  display: flex;
}

.column {
  flex: 1;
}

.option {
  font-size: medium;
  padding: 0.5rem;
}

.heuristics {
  margin-left: 2rem;
}
</style>
