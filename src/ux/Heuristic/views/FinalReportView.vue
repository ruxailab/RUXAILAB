<template>
  <PageWrapper
    :title="answers.length > 0 ? $t('Final Report') : ''"
    :loading="loading"
    :loading-text="$t('HeuristicsReport.messages.reports_loading')"
    :side-gap="true"
  >
    <!-- Subtitle Slot - only show when answers exist -->
    <template v-if="answers.length > 0" #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        Prepare the final report for the heuristic evaluation
      </p>
    </template>

    <!-- Show IntroFinalReport when no answers -->
    <IntroFinalReport v-if="answers.length === 0" @go-to-coops="goToCoops" />

    <!-- Show main content when answers exist -->
    <div v-else class="finalReportView">
      <v-container>
        <v-stepper
          :model-value="step"
          style="background-color: #f5f7ff"
          class="final-report-box rounded pt-0 mb-4"
          elevation="0"
        >
          <v-stepper-header style="background-color: #f5f7ff" class="pt-2">
            <v-stepper-item :complete="step > 1" :value="1" color="orange">
              Report Conclusion
            </v-stepper-item>
            <v-divider />
            <v-stepper-item :complete="step > 2" :value="2" color="orange">
              Paso intermedio
            </v-stepper-item>
            <v-divider />
            <v-stepper-item :complete="step > 3" :value="3" color="orange">
              Generate Report
            </v-stepper-item>
          </v-stepper-header>

          <v-stepper-window style="background-color: #f5f7ff" class="mt-0">
            <v-stepper-window-item :value="1" class="align-mid pt-5 min-h-500">
              <div v-if="loading">Saving Conclusion on Test....</div>
              <div v-else class="container">
                <div class="row">
                  <TextControls />
                </div>

                <div class="row">
                  <div class="col">
                    <div id="myTextarea" contenteditable class="form-control" />
                  </div>
                </div>
                <v-row class="ma-0" justify="end">
                  <v-btn
                    class="mt-4"
                    align="right"
                    color="orange"
                    elevation="0"
                    @click="handleNext"
                  >
                    {{ $t('buttons.next') }}
                  </v-btn>
                </v-row>
              </div>
            </v-stepper-window-item>

            <!-- Paso intermedio: comentarios por heurística -->
            <v-stepper-window-item :value="2" class="align-mid pt-5 min-h-500">
              <div class="container">
                <div class="d-flex justify-space-between align-center mb-6">
                  <h3>Comentarios por heurística</h3>
                  <v-chip color="primary" variant="tonal">
                    {{ commentsCount }} /
                    {{ (test?.testStructure || []).length }} completados
                  </v-chip>
                </div>

                <div
                  class="comments-container"
                  style="max-height: 60vh; overflow-y: auto"
                >
                  <v-expansion-panels variant="accordion" multiple>
                    <v-expansion-panel
                      v-for="(heuristic, index) in test?.testStructure || []"
                      :key="heuristic.id"
                      :value="heuristic.id"
                    >
                      <v-expansion-panel-title>
                        <div class="d-flex align-center gap-2">
                          <v-icon
                            :color="
                              heuristicComments[heuristic.id]
                                ? 'success'
                                : 'grey'
                            "
                            size="small"
                          >
                            {{
                              heuristicComments[heuristic.id]
                                ? 'mdi-check-circle'
                                : 'mdi-circle-outline'
                            }}
                          </v-icon>
                          <span class="font-weight-medium">
                            {{ index + 1 }}.
                            {{ heuristic.title || heuristic.name }}
                          </span>
                        </div>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <TextareaForm
                          v-model="heuristicComments[heuristic.id]"
                          :title="'Comentario'"
                          :subtitle="'Escribe un comentario para esta heurística'"
                        />
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>

                <v-row
                  class="ma-0 mt-6"
                  justify="space-between"
                  align-content="end"
                >
                  <v-btn
                    color="blue-grey-darken-3"
                    elevation="0"
                    @click="step = 1"
                    >Anterior</v-btn
                  >
                  <v-btn
                    color="orange"
                    :loading="loading"
                    @click="handleNextFromComments"
                    >Siguiente</v-btn
                  >
                </v-row>
              </div>
            </v-stepper-window-item>

            <v-stepper-window-item :value="3" class="align-mid pt-5 min-h-500">
              <FinalReportSelectionBox
                :heuristic-comments="heuristicComments"
                @return-step="step--"
              />
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-container>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import TextControls from '@/ux/Heuristic/components/final_report/FinalReportControls.vue'
import FinalReportSelectionBox from '@/ux/Heuristic/components/final_report/FinalReportSelectionBox.vue'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import IntroFinalReport from '@/ux/Heuristic/components/IntroFinalReport.vue'
import TextareaForm from '@/shared/components/TextareaForm.vue'

const store = useStore()
const router = useRouter()

const step = ref(1)
const subStep = ref(1)
const object = ref({})
let intro = ref(null)

const loading = ref(false)

const test = computed(() => store.getters.test)

// Comentarios por heurística (reactivo por id)
const heuristicComments = reactive({})

// Contador de comentarios completados
const commentsCount = computed(() => {
  return Object.values(heuristicComments).filter(
    (comment) => comment && comment.trim().length > 0,
  ).length
})

// Cargar comentarios existentes del test
watch(
  () => test.value,
  (testValue) => {
    if (testValue?.heuristicComments) {
      Object.assign(heuristicComments, testValue.heuristicComments)
    }
  },
  { immediate: true },
)

// Inicializar campos vacíos para nuevas heurísticas
watch(
  () => test.value?.testStructure,
  (structure) => {
    if (Array.isArray(structure)) {
      structure.forEach((heuristic) => {
        if (!(heuristic.id in heuristicComments)) {
          heuristicComments[heuristic.id] = ''
        }
      })
    }
  },
  { immediate: true },
)

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)

const answers = computed(() => {
  if (testAnswerDocument.value && testAnswerDocument.value.heuristicAnswers) {
    return Object.values(testAnswerDocument.value.heuristicAnswers)
  }
  return []
})

const setInnerHtml = () => {
  const textarea = document.getElementById('myTextarea')
  if (textarea) {
    textarea.innerHTML = test.value.studyConclusion || ''
  }
}

const update = async () => {
  const contenteditable = document.getElementById('myTextarea')
  const text = contenteditable.innerHTML

  object.value.studyConclusion = text
  const rawData = { ...test.value, ...object.value }
  const updatedTest = instantiateStudyByType(rawData.testType, rawData)
  await store.dispatch('updateStudy', updatedTest)
  await store.dispatch('getStudy', { id: test.value.id })
}

const handleNext = async () => {
  loading.value = true
  await update()
  loading.value = false
  step.value++
}

const saveHeuristicComments = async () => {
  loading.value = true
  object.value.heuristicComments = { ...heuristicComments }
  const rawData = { ...test.value, ...object.value }
  const updatedTest = instantiateStudyByType(rawData.testType, rawData)
  await store.dispatch('updateStudy', updatedTest)
  await store.dispatch('getStudy', { id: test.value.id })
  loading.value = false
}

const handleNextFromComments = async () => {
  await saveHeuristicComments()
  step.value++
}

const goToCoops = () => {
  if (test.value?.id) {
    router.push(`/heuristic/cooperators/${test.value.id}`)
  }
}

onMounted(() => {
  setInnerHtml()
})
</script>

<style scoped>
.form-control {
  background-color: white;
  box-shadow:
    0px 0px 0px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 0px rgba(0, 0, 0, 0.14),
    0px 0px 0px 0px rgba(0, 0, 0, 0.12) !important;
  width: 100%;
  height: 55vh;
  resize: none;
  padding: 20px;
  border-radius: 12px;
  overflow: auto;
  font-size: small;
}
</style>
