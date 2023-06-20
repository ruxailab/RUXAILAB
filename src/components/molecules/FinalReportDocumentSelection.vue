<template>
  <div class="flex-container">
    <div class="flex-items"><SelectionBox></SelectionBox></div>

    <div class="flex-items">
      <p>Review your information before submitting.</p>
      <PdfGenerator :data="selectedTestElements"></PdfGenerator>
    </div>
  </div>
</template>

<script>
import SelectionBox from '@/components/atoms/FinalReportSelectionBox.vue'
import PdfGenerator from '@/components/atoms/PdfGenerateBtn.vue'
export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({
    selectedTestElements: null,
  }),
  components: { SelectionBox, PdfGenerator },
  computed: {
    test() {
      return this.$store.getters.test
    },
  },
  watch: {},

  methods: {
    genPreview() {
      let options = document.getElementById('options')
      let comments = document.getElementById('comments')
      let results = document.getElementById('results')
      let finalReport = document.getElementById('finalReport')
      let pdfElements = []

      if (options.checked == true) {
        pdfElements.push(this.test.testOptions)
      }
      if (comments.checked == true) {
        let answersDocId = this.test.answersDocId
        //need to get only the comments, not the answersDocId
        pdfElements.push(answersDocId)
      }
      if (results.checked == true) {
        let answersDocId = this.test.answersDocId
        //need to get only the results + graphics, not the answersDocId
        pdfElements.push(answersDocId)
      }
      if (finalReport.checked) {
        pdfElements.push(this.test.finalReport)
      }
      console.log(pdfElements)
    },
  },
}
</script>

<style>
.countainer {
  width: 100vw;
  height: 100vh;
}

.flex-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: normal;
  align-items: normal;
  align-content: normal;
}

.flex-items:nth-child(1) {
  display: block;
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
  align-self: auto;
  order: 0;
}

.flex-items:nth-child(2) {
  display: block;
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
  align-self: auto;
  order: 0;
}
</style>
