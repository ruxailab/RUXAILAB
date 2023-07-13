<template>
  <div>
    <v-btn @click="submitPdf">Generate PDF</v-btn>
  </div>
</template>

<script>
import axios from 'axios'
import { finalResult } from '@/utils/statistics'

export default {
  data: () => ({
    formattedDate: '',
    statistics: '',
  }),
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
  methods: {
    finalResult,
    submitPdf() {
      console.log(this.test)

      console.log('puta')
      console.log(this.test.testOptions)
      console.log(this.answers)
      console.log(this.test.testAdmin.email)
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

      axios
        .post(
          'http://localhost:8000/api/endpoint',
          {
            items: [
              {
                title: this.test.testTitle,
                date: this.formattedDate,
                finalReport: this.test.finalReport,
                allOptions: this.test.testOptions,
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
