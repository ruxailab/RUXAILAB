<template>
  <div class="countainer" style="display: flex;">
    <SelectionBox></SelectionBox>
    <div class="document-preview">tests</div>
  </div>
</template>

<script>
import SelectionBox from '@/components/atoms/FinalReportSelectionBox.vue'
export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({}),
  components: { SelectionBox },
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
      let preview = []

      if (options.checked == true) {
        preview.push(this.test.testOptions)
      }
      if (comments.checked == true) {
        let answersDocId = this.test.answersDocId
        //need to get only the comments, not the answersDocId
        preview.push(answersDocId)
      }
      if (results.checked == true) {
        let answersDocId = this.test.answersDocId
        //need to get only the results + graphics, not the answersDocId
        preview.push(answersDocId)
      }
      if (finalReport.checked) {
        preview.push(this.test.finalReport)
      }
      console.log(preview)
    },
  },
}
</script>

<style>
.countainer {
  width: 100vw;
  height: 100vh;
  margin-left: -5vh;
  align-items: center;
  justify-content: center;
}

.document-preview {
  width: 55vw;
  height: 80vh;
  background-color: whitesmoke;
  border-radius: 0px 0px 36px 0px;
  /* background-color: rgb(255, 255, 255); */
}
</style>
