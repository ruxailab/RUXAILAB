<template>
  <div>
    <v-stepper v-model="step" class="final-report-box">
      <v-stepper-header>
        <v-stepper-step :complete="step > 1" step="1"></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="step > 2" step="2"></v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="step > 3" step="3"></v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1" class="align-mid">
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
          <!-- <v-btn
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
          </v-btn> -->
          <v-btn color="primary" class="teste" @click="step++, update()"
            >Next</v-btn
          >
        </v-stepper-content>

        <v-stepper-content step="2">
          <DocumentSelection></DocumentSelection>
          <v-btn color="primary" class="teste" @click="step++">Next</v-btn>
          <v-btn color="secondary" class="teste2" @click="step--"
            >Previous</v-btn
          >
        </v-stepper-content>

        <v-stepper-content step="3">
          <p>Review your information before submitting.</p>
          <!-- espaço para prévia do pdf e download -->
          <v-btn color="primary" @click="submitForm()">Submit</v-btn>
          <v-btn color="secondary" @click="step--">Previous</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
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
    step: 1,
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
  height: 100vh;
  padding: 0;
}
.form-control {
  background-color: white;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
  width: 85%;
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
