<template>
  <div
    class="selection-box"
    style=" flex-direction: column; align-items: center;"
  >
    <h2>SELECT YOUR PDF ELEMENTS</h2>
    <div style="display: flex; flex-direction: column;">
      Test heuristics:
      <div v-for="heuristics in this.test.testStructure" :key="heuristics.id">
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
      </div>
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
        <label for="results"> Answers results</label>
      </div>
      <div class="option">
        <input type="checkbox" id="finalReport" name="finalReport" />
        <label for="finalReport"> Final Report</label>
      </div>
    </div>
    <v-btn @click="genPreview"> Generate preview</v-btn>
  </div>
</template>

<script>
export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({ preview: new Object() }),
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

      for (let i = 0; i <= this.test.testStructure.length; i++) {
        // let auxId = document.getElementById(this.test.testStructure[i].name)
        let auxId = document.getElementById('heuristic' + i)

        console.log(auxId)
        // if (auxId) {
        //   preview.push(this.test.testStructure[i].name)
        // }
      }

      if (options.checked == true) {
        this.preview.testOptions = this.test.testOptions
      }
      if (comments.checked == true) {
        let answersDocId = this.test.answersDocId
        //need to get only the comments, not the answersDocId
        this.preview.testComments = answersDocId
      }
      if (results.checked == true) {
        let answersDocId = this.test.answersDocId
        //need to get only the results + graphics, not the answersDocId
        this.preview.results = answersDocId
      }
      if (finalReport.checked) {
        this.preview.finalReport = this.test.finalReport
      }
      console.log(this.preview)
    },
  },
}
</script>

<style>
.selection-box {
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
