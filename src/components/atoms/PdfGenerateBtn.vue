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

export default {
  methods: {
    submitPdf() {
      axios
        .post(
          'http://localhost:8000/api/endpoint',
          {
            items: [
              { name: 'Product 1', quantity: 2, price: 10.0 },
              { name: 'Product 2', quantity: 1, price: 20.0 },
            ],
            total: 40.0,
          },
          { responseType: 'blob' },
        )
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'invoice.pdf')
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => {
          console.error(error)
        })
    },
  },
}
</script>
