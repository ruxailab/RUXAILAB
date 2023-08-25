<template>
  <v-container>
    <ShowInfo style="padding: 0!important;" title="Final Report"></ShowInfo>

    <v-stepper
      style="background: linear-gradient(to top, rgba(245, 245, 245, 1), rgba(245, 245, 245, 0));"
      v-model="step"
      class="final-report-box"
    >
      <v-stepper-header background-color="transparent">
        <v-stepper-step :complete="step > 1" step="1"></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="step > 2" step="2"></v-stepper-step>
      </v-stepper-header>

      <v-stepper-items style="background-color:#F5F5F5">
        <v-stepper-content step="1" class="align-mid">
          <div class="container">
            <div class="row">
              <TextControls></TextControls>
            </div>

            <div class="row">
              <div class="col">
                <div contenteditable id="myTextarea" class="form-control"></div>
              </div>
            </div>
          </div>
          <v-btn color="primary" class="teste" @click="step++, update()"
            >Next</v-btn
          >
        </v-stepper-content>

        <v-stepper-content step="2">
          <div>
            <DocumentSelection></DocumentSelection>

            <v-btn color="secondary" class="teste2" @click="step--"
              >Previous</v-btn
            >
          </div>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>

<script>
import TextControls from '@/components/atoms/FinalReportControls.vue'
import DocumentSelection from '@/components/molecules/FinalReportDocumentSelection.vue'
import ShowInfo from '@/components/organisms/ShowInfo.vue'

export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({
    title: 'Final report',
    inputText: '',
    object: {},
    textIsDone: false,
    step: 1,
    selectedTestElements: null,
  }),
  mounted() {
    this.setInnerHtml()
  },
  computed: {
    test() {
      return this.$store.getters.test
    },
  },
  watch: {},
  components: { TextControls, DocumentSelection, ShowInfo },

  methods: {
    setInnerHtml() {
      const textarea = document.getElementById('myTextarea')
      if (textarea) {
        textarea.innerHTML = this.test.finalReport
      }
    },
    async update() {
      let contenteditable = document.getElementById('myTextarea'),
        text = contenteditable.innerHTML

      this.object.finalReport = text
      let auxT = Object.assign(this.test, this.object)
      this.$store.dispatch('updateTest', auxT)
    },
  },
}
</script>

<style scoped>
/* * {
  padding: 0;
} */
.teste {
  position: fixed;
  right: 8%;
  bottom: 10%;
}
.teste2 {
  position: fixed;
  right: 8%;
  bottom: 3%;
}
.cloud-button {
  padding: 10px;
}
.left {
  justify-items: right;
}

.final-report-box {
  background-color: whitesmoke;
  width: 100%;

  padding: 0;
}
.form-control {
  background-color: white;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
  width: 100%;
  height: 65vh;
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
