<template>
  <div
    class="selection-box"
    style=" flex-direction: column; align-items: center;"
  >
    <h2>SELECT YOUR PDF ELEMENTS</h2>
    <div style="display: flex; flex-direction: column;">
      Test heuristics:
      <!-- <div v-for="heuristics in this.test.testStructure" :key="heuristics.id">
        <div class="option heuristics">
          <input
            type="checkbox"
            :id="'heuristic' + heuristics.id"
            :name="heuristics.name"
          />
          <label :for="heuristics.name">
            Heuristic {{ heuristics.id }} - {{ heuristics.title }}</label
          >
        </div>
      </div> -->
      <div class="option">
        <input type="checkbox" id="options" name="options" />
        <label for="options"> Test options</label>
      </div>
      <div class="option">
        <input type="checkbox" id="comments" name="comments" />
        <label for="comments"> Answers comments</label>
      </div>
      <div class="option">
        <input type="checkbox" id="results" name="results" />
        <label for="results"> Statistics</label>
      </div>
      <div class="option">
        <input
          type="checkbox"
          id="evaluators-results"
          name="evaluators-results"
        />
        <label for="results"> Answers by evaluators</label>
      </div>
      <div class="option">
        <input
          type="checkbox"
          id="heuristics-results"
          name="heuristics-results"
        />
        <label for="results"> Answers by heuristics</label>
      </div>
      <div class="option">
        <input type="checkbox" id="finalReport" name="finalReport" />
        <label for="finalReport"> Final Report</label>
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
  data: () => ({ preview: new Object(), formattedDate: '', statistics: '' }),
  computed: {
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
  },
  watch: {},

  methods: {
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
        await this.$store.dispatch('getCurrentTestAnswerDoc')
        let answersDocId = this.$store.getters.testAnswerDocument
          .heuristicAnswers
        this.preview.testComments = answersDocId
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
      console.log(this.answers)
      axios
        .post(
          'http://localhost:8000/api/endpoint',
          {
            items: [
              {
                title: this.test.testTitle, //
                date: this.formattedDate, //
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
.selection-box {
  margin-left: 0px;
  width: 30vw;
  height: 80vh;

  background-color: white;
  /* background-color: rgb(247, 246, 246); */

  padding: 1rem;
  border-radius: 36px 0px 0 0;
}
.option {
  font-size: small;
  padding: 1rem;
}
.heuristics {
  margin-left: 2rem;
}
</style>
