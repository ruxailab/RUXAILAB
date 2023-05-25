<!-- <template>
  <v-btn @click="submitPdf">Generate PDF</v-btn>
</template>

<script>
import axios from 'axios'
export default {
  data: () => ({}),
  methods: {
    // submitPdf() {
    //   console.log('entrou')
    //   console.log(process.env.VUE_APP_LARAVEL_PDF)
    //   axios
    //     .get(process.env.VUE_APP_LARAVEL_PDF)
    //     .then((response) => {
    //       console.log(response)
    //       // Handle the response from the Laravel application
    //     })
    //     .catch((error) => {
    //       console.log(error)
    //       // Handle the error
    //     })
    //   console.log('FUncionou!')
    // },

    submitPdf() {
      console.log('entrou')
      console.log(process.env.VUE_APP_LARAVEL_PDF)
      axios
        .post(
          'http://localhost:8000/api/endpoint',
          {
            items: [
              {
                name: 'Product 1',
                quantity: 2,
                price: 10.0,
              },
              {
                name: 'Product 2',
                quantity: 1,
                price: 20.0,
              },
            ],
            total: 40.0,
          },
          { responseType: 'blob' },
        )
        .then((response) => {
          console.log(response)
          // const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
          // const pdfUrl = URL.createObjectURL(pdfBlob)
          // const downloadLink = document.createElement('a')
          // downloadLink.href = pdfUrl
          // downloadLink.download = 'document.pdf'
          // downloadLink.click()
          // Handle the response from the Laravel application
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'invoice.pdf')
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => {
          console.log(error)
          // Handle the error
        })
      console.log('FUncionou!')
    },
  },
}
</script> -->
<template>
  <div>
    <v-btn @click="submitPdf">Generate PDF</v-btn>
  </div>
</template>

<script>
import axios from 'axios'
import {
  standardDeviation,
  calcFinalResult,
  finalResult,
} from '@/utils/statistics'

export default {
  data: () => ({
    formattedDate: '',
  }),
  computed: {
    test() {
      return this.$store.getters.test
    },
  },
  methods: {
    submitPdf() {
      let x = finalResult()
      let y = calcFinalResult()
      let z = standardDeviation()
      console.log(x)
      // console.log(y)
      // console.log(z)
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
      console.log(this.formattedDate) // Output: "11th May, 2023"

      axios
        .post(
          'http://localhost:8000/api/endpoint',
          {
            items: [
              {
                title: this.test.testTitle,
                date: this.formattedDate,
                aut: 'Tales Augusto Sartório Furlan',
                finalReport: '',
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
