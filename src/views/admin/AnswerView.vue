<template>
  <div>
    <!-- checking whether to show heuristics answer sheet or user answer sheet-->
    <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsTestAnswer />
    </div>
    <div v-else>
      <UserTestAnswer />
    </div>
  </div>
</template>

<script>
import HeuristicsTestAnswer from '@/components/organisms/HeuristicsTestAnswer.vue'
import UserTestAnswer from '@/components/organisms/UserTestAnswer.vue'
export default {
  components: {
    HeuristicsTestAnswer,
    UserTestAnswer,
  },

  computed: {
    showFinalResult() {
      return finalResult()
    },
    evaluatorStatistics() {
      return this.$store.state.Answer.evaluatorStatistics
    },
    sortedEvaluatorStatistics() {
    return this.evaluatorStatistics.items.slice().sort((a, b) => {
      const parseDate = (dateStr) => {
        const [day, month, yearTime] = dateStr.split('/')
        const [year, time] = yearTime.split(', ')
        const [hours, minutes, seconds] = time.split(':')
        // Adjust the date format to 'month/day/year'
        return new Date(`${month}/${day}/${year} ${time}`)
      }

      const dateA = parseDate(a.lastUpdate)
      const dateB = parseDate(b.lastUpdate)

      return dateB - dateA // sort in descending order
    })
  },
    heuristicsEvaluator() {
      const table = {
        header: [],
        items: [],
      }
      const options = this.test.testOptions.map((op) => op.value)
      const max = Math.max(...options)
      const min = Math.min(...options)

      table.header.push({
        text: 'HEURISTICS',
        align: 'start',
        value: 'heuristic',
      })
      if (this.resultEvaluator) {
        this.resultEvaluator.forEach((evaluator) => {
          const header = table.header.find((h) => h.text == evaluator.id)
          if (!header) {
            table.header.push({
              text: evaluator.id,
              align: 'center',
              value: evaluator.id,
            })
          }
          evaluator.heuristics.forEach((heuristic) => {
            const item = table.items.find((i) => i.heuristic == heuristic.id)
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
    heuristicsStatistics() {
      const table = {
        header: [],
        items: [],
      }

      table.header = [
        {
          text: 'HEURISTICS',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        {
          text: 'Percentage (%)',
          value: 'percentage',
          align: 'center',
          sortable: false,
        },

        {
          text: 'Standard deviation',
          value: 'sd',
          align: 'center',
          sortable: false,
        },
        {
          text: 'Average',
          value: 'average',
          align: 'center',
          sortable: false,
        },
        { text: 'Max', value: 'max', align: 'center', sortable: false },
        { text: 'Min', value: 'min', align: 'center', sortable: false },
      ]

      if (this.heuristicsEvaluator.items) {
        this.heuristicsEvaluator.items.forEach((item) => {
          const results = Object.entries(item)
            .filter((item) => item[0].includes('Ev'))
            .map((item) => item[1])
          const valueToConvert = results
              .reduce((total, value) => total + value / results.length, 0)
              .toFixed(2),
            convertedValue =
              ((valueToConvert - item.min) / (item.max - item.min)) * 100
          table.items.push({
            name: item.heuristic,
            max: Math.max(item.max).toFixed(2),
            min: Math.min(item.min).toFixed(2),
            percentage: convertedValue.toFixed(2),
            sd: standardDeviation(results).toFixed(2),
            average: results
              .reduce((total, value) => total + value / results.length, 0)
              .toFixed(2),
          })
        })
      }
      return table
    },

    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
  },
}
</script>

<style></style>
