<template>
  <div class="final-report-box">
    <div class="container">
      <div class="row">
        <div class="col">
          <h1>{{ title }}</h1>
        </div>
      </div>
      <TextControls></TextControls>
      <div class="row">
        <div class="col">
          <div contenteditable id="myTextarea" class="form-control"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TextControls from '@/components/atoms/FinalReportControls.vue'

export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({ title: 'FINAL REPORT', inputText: '' }),
  computed: {},
  watch: {},
  components: { TextControls },

  methods: {},
}
</script>

<style scoped>
.final-report-box {
  background-color: whitesmoke;
  width: 100vw;
  height: 90vh;
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
}

.text-editor {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style>
