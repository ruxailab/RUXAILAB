<template>
  <div>
    <div class="final-report-box" v-if="!textIsDone">
      <div class="container">
        <div class="row">
          <div class="col">
            <h1 style="font: Roboto">{{ title }}</h1>
          </div>
        </div>
        <div class="row">
          <TextControls></TextControls>
          <div class="col left">
            <!-- <button class="cloud-button" @click="setInnerHtml()">set</button> -->
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div contenteditable id="myTextarea" class="form-control">
              <!-- {{ this.test.finalReport }} -->
            </div>
          </div>
        </div>
      </div>
      <v-btn
        large
        dark
        fab
        fixed
        bottom
        color="#F9A826"
        style="z-index:1000, margin-right:0"
        @click="update()"
      >
        <v-icon large>
          mdi-content-save
        </v-icon>
      </v-btn>
    </div>
    <div v-if="textIsDone">
      <DocumentSelection></DocumentSelection>
    </div>
    <v-btn
      large
      dark
      fixed
      bottom
      right
      color="#F9A826"
      style="z-index:1000"
      @click="textIsDone = !textIsDone"
      >Next step</v-btn
    >
  </div>
</template>

<script>
import TextControls from '@/components/atoms/FinalReportControls.vue'
import DocumentSelection from '@/components/molecules/FinalReportDocumentSelection.vue'

export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({
    title: 'FINAL REPORT',
    inputText: '',
    object: {},
    textIsDone: false,
  }),
  mounted() {
    document.getElementById('myTextarea').innerHTML = this.test.finalReport
  },
  computed: {
    test() {
      return this.$store.getters.test
    },
  },
  watch: {},
  components: { TextControls, DocumentSelection },

  methods: {
    setInnerHtml() {
      document.getElementById('myTextarea').innerHTML = this.test.finalReport
    },
    async update() {
      console.log('olá')
      let contenteditable = document.getElementById('myTextarea'),
        text = contenteditable.innerHTML

      this.object.finalReport = text
      let auxT = Object.assign(this.test, this.object)
      this.$store.dispatch('updateTest', auxT)

      // if (this.test !== null && this.test !== undefined) {
      //   let contenteditable = document.getElementById('myTextarea'),
      //     text = contenteditable.innerHTML
      //   this.object.finalReport = text
      //   this.object = await Object.assign(
      //     this.test.finalReport,
      //     this.object.finalReport,
      //   )
      //   console.log(this.object)
      //   await this.$store.dispatch('updateTest', new Test(this.object))
      //   this.$store.commit('SET_LOCAL_CHANGES', false)
      // } else {
      //   console.log('test is null or undefined')
      // }
    },
  },
}
</script>

<style scoped>
* {
  padding: 0;
}

.cloud-button {
  padding: 10px;
}
.left {
  justify-items: right;
}

.final-report-box {
  background-color: whitesmoke;
  width: 100vw;
  height: 100vh;
  padding: 0;
}
.form-control {
  background-color: white;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
  width: 85vw;
  height: 70vh;
  resize: none;
  padding: 20px;
  border-radius: 12px;
  overflow: auto;
  font-size: small;
}

.text-editor {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style>
