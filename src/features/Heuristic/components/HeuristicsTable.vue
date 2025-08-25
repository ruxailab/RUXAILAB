<template>
  <v-app>
    <v-main>
      <v-container
        fluid
        class="pa-6"
      >
        <!-- Header Section -->
        <div class="d-flex align-center justify-space-between mb-8">
          <div>
            <h1 class="text-h3 font-weight-bold text-on-surface mb-2">
              {{ $t('HeuristicsTable.titles.currentHeuristics') }}
            </h1>
          </div>
          
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            variant="elevated"
            size="large"
            :disabled="testAnswerDocLength > 0"
            class="text-none"
            @click="dialogHeuris = true"
          >
            {{ $t('HeuristicsTable.titles.addNewHeuristic') }}
          </v-btn>
        </div>

        <!-- Search Row -->
        <v-row class="mb-8">
          <v-col cols="12">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              :label="$t('HeuristicsTable.titles.searchHeuristics')"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
            />
          </v-col>
        </v-row>

        <!-- Heuristics Cards -->
        <v-row>
          <v-col
            v-for="(heuristic, index) in filteredHeuristics"
            :key="heuristic.id"
            cols="12"
          >
            <v-card
              elevation="2"
              class="mb-4 heuristic-card"
              :class="{ 'expanded': itemSelect === index }"
            >
              <!-- Heuristic Header -->
              <v-card-title class="d-flex align-center pa-4">
                <v-btn
                  :icon="itemSelect === index ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  variant="text"
                  size="small"
                  class="me-3"
                  @click="toggleHeuristic(index)"
                />
                
                <div class="flex-grow-1">
                  <h3 class="text-h6 font-weight-medium text-on-surface">
                    {{ heuristic.id + 1 }} - {{ heuristic.title }}
                  </h3>
                  <p class="text-body-2 text-ternary ma-0 mt-1">
                    {{ heuristic.questions.length }} {{ $t('HeuristicsTable.titles.questions') }}
                  </p>
                </div>

                <div class="d-flex gap-2">
                  <v-btn
                    icon="mdi-arrow-up"
                    variant="text"
                    size="small"
                    color="accent"
                    :disabled="index === 0 || testAnswerDocLength > 0"
                    @click="moveItemUp(index)"
                  >
                    <v-icon>mdi-arrow-up</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >
                      {{ $t('HeuristicsTable.titles.moveUp') }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="mdi-arrow-down"
                    variant="text"
                    size="small"
                    color="accent"
                    :disabled="index === filteredHeuristics.length - 1 || testAnswerDocLength > 0"
                    @click="moveItemDown(index)"
                  >
                    <v-icon>mdi-arrow-down</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >
                      {{ $t('HeuristicsTable.titles.moveDown') }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="mdi-plus"
                    variant="text"
                    size="small"
                    color="accent"
                    :disabled="testAnswerDocLength > 0"
                    @click="setupQuestion(heuristic.id)"
                  >
                    <v-icon>mdi-plus</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >
                      {{ $t('HeuristicsTable.titles.addNewQuestion') }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    color="primary"
                    @click="editHeuris(heuristic)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >
                      {{ $t('HeuristicsTable.titles.editHeuristic') }}
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    :disabled="testAnswerDocLength > 0"
                    @click="deleteHeuristic(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >
                      {{ $t('HeuristicsTable.titles.deleteHeuristic') }}
                    </v-tooltip>
                  </v-btn>
                </div>
              </v-card-title>

              <!-- Expanded Content -->
              <v-expand-transition>
                <div v-if="itemSelect === index">
                  <v-divider />
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center justify-space-between mb-4">
                      <h4 class="text-h6 text-on-surface">
                        {{ $t('HeuristicsTable.titles.questions') }}
                      </h4>
                      <v-chip
                        :color="heuristic.questions.length > 0 ? 'success' : 'warning'"
                        variant="tonal"
                        size="small"
                      >
                        {{ heuristic.questions.length }} {{ heuristic.questions.length === 1 ? $t('Question') : $t('Questions') }}
                      </v-chip>
                    </div>

                    <!-- Questions Grid -->
                    <div
                      v-if="heuristic.questions.length > 0"
                      class="questions-list"
                    >
                      <v-card
                        v-for="(question, qIndex) in heuristic.questions"
                        :key="question.id"
                        variant="outlined"
                        class="question-card mb-3"
                        @click="questionSelect = qIndex"
                      >
                        <v-card-text class="pa-4">
                          <div class="d-flex align-center justify-space-between">
                            <div class="d-flex align-center flex-grow-1">
                              <v-chip
                                color="primary"
                                variant="tonal"
                                size="small"
                                class="me-3"
                              >
                                Q{{ qIndex + 1 }}
                              </v-chip>
                              <h5 class="text-subtitle-1 font-weight-medium text-on-surface">
                                {{ question.title }}
                              </h5>
                            </div>
                            <div class="d-flex gap-1">
                              <v-btn
                                icon="mdi-pencil"
                                variant="text"
                                size="small"
                                color="primary"
                                @click.stop="editQuestions(question)"
                              />
                              <v-btn
                                icon="mdi-delete"
                                variant="text"
                                size="small"
                                color="error"
                                :disabled="testAnswerDocLength > 0"
                                @click.stop="deleteQuestion(qIndex)"
                              />
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>

                      <!-- Descriptions Section -->
                      <v-card
                        v-if="questionSelect !== null"
                        class="mt-4"
                      >
                        <v-card-text>
                          <div class="d-flex align-center justify-space-between mb-4">
                            <h4 class="text-h6 text-on-surface">
                              {{ $t('HeuristicsTable.titles.descriptions') }}
                            </h4>
                            <AddDescBtn
                              :question-index="questionSelect"
                              :heuristic-index="itemSelect"
                              @update-description="updateDescription"
                            />
                          </div>
                          <v-data-table
                            :headers="headers"
                            :items="heuristic.questions[questionSelect].descriptions"
                            :items-per-page="5"
                            class="elevation-0"
                          >
                            <template #item.actions="{ item }">
                              <v-row
                                justify="end"
                                class="pr-1"
                              >
                                <v-btn
                                  icon
                                  size="small"
                                  class="mr-2"
                                  @click="editDescription(item)"
                                >
                                  <v-icon size="small">
                                    mdi-pencil
                                  </v-icon>
                                </v-btn>
                                <v-btn
                                  icon
                                  size="small"
                                  @click="deleteItem(item)"
                                >
                                  <v-icon size="small">
                                    mdi-delete
                                  </v-icon>
                                </v-btn>
                              </v-row>
                            </template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </div>

                    <!-- Empty State for Questions -->
                    <v-card
                      v-else
                      variant="outlined"
                      class="text-center pa-8"
                      style="border-style: dashed;"
                    >
                      <v-icon
                        icon="mdi-help-circle-outline"
                        size="48"
                        color="secondary"
                        class="mb-4"
                      />
                      <h4 class="text-h6 text-secondary mb-2">
                        {{ $t('HeuristicsTable.titles.noQuestions') }}
                      </h4>
                      <p class="text-body-2 text-secondary mb-4">
                        {{ $t('HeuristicsTable.messages.startAddingQuestions') }}
                      </p>
                      <v-btn
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-plus"
                        :disabled="testAnswerDocLength > 0"
                        @click="setupQuestion(heuristic.id)"
                      >
                        {{ $t('HeuristicsTable.titles.addNewQuestion') }}
                      </v-btn>
                    </v-card>
                  </v-card-text>
                </div>
              </v-expand-transition>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State for No Heuristics -->
        <v-row v-if="filteredHeuristics.length === 0">
          <v-col cols="12">
            <v-card
              class="text-center pa-8"
              variant="outlined"
            >
              <v-icon
                icon="mdi-file-remove"
                size="64"
                color="primary"
                class="mb-4"
              />
              <h3 class="text-h5 text-ternary mb-2">
                {{ $t('HeuristicsTable.titles.noHeuristicsFound') }}
              </h3>
              <p class="text-body-1 text-ternary">
                {{ $t('HeuristicsTable.messages.noHeuristics') }}
              </p>
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-plus"
                :disabled="testAnswerDocLength > 0"
                @click="dialogHeuris = true"
              >
                {{ $t('HeuristicsTable.titles.addNewHeuristic') }}
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Add/Edit Heuristic Dialog -->
        <v-dialog
          v-model="dialogHeuris"
          max-width="600"
          persistent
        >
          <v-card>
            <v-card-title
              class="text-h5 pa-6"
              style="background-color: #00213F; color: white;"
            >
              {{ $t('HeuristicsTable.titles.creatingHeuristic') }}
            </v-card-title>
            <v-card-text class="pa-6">
              <v-form
                ref="formHeurisRef"
                @keyup.enter="addHeuris"
              >
                <v-text-field
                  v-model="heuristicForm.title"
                  :label="$t('HeuristicsTable.placeholders.titleYourHeuristic')"
                  variant="outlined"
                  density="comfortable"
                  :rules="nameRequired"
                  class="mb-4"
                  autofocus
                />
                <v-text-field
                  v-model="heuristicForm.questions[0].title"
                  :label="$t('HeuristicsTable.placeholders.titleYourQuestion')"
                  variant="outlined"
                  density="comfortable"
                  :rules="questionRequired"
                />
              </v-form>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-spacer />
              <v-btn
                variant="text"
                @click="closeDialog('dialogHeuris')"
              >
                {{ $t('HeuristicsTable.titles.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                @click="addHeuris"
              >
                {{ $t('HeuristicsTable.titles.add') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Add Question Dialog -->
        <v-dialog
          v-model="dialogQuestion"
          max-width="600"
          persistent
        >
          <v-card>
            <v-card-title
              class="text-h5 pa-6"
              style="background-color: #fca326; color: white;"
            >
              {{ $t('HeuristicsTable.titles.newQuestion') }}
            </v-card-title>
            <v-card-text class="pa-6 pt-0">
              <v-form
                ref="formQuestionRef"
                @submit.prevent="addQuestion"
              >
                <v-text-field
                  v-model="newQuestion.title"
                  :label="$t('HeuristicsTable.placeholders.titleNewQuestion')"
                  variant="outlined"
                  density="comfortable"
                  :rules="questionRequired"
                  autofocus
                />
              </v-form>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-spacer />
              <v-btn
                variant="text"
                @click="closeDialog('dialogQuestion')"
              >
                {{ $t('HeuristicsTable.titles.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                @click="addQuestion"
              >
                {{ $t('HeuristicsTable.titles.add') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Edit Heuristic/Question Dialog -->
        <v-dialog
          v-model="dialogEdit"
          max-width="600"
          persistent
        >
          <v-card>
            <v-card-title
              class="text-h5 pa-6"
              style="background-color: #fca326; color: white;"
            >
              {{ itemEdit ? itemEdit.title : '' }}
            </v-card-title>
            <v-card-text class="pa-6 pt-0">
              <v-form
                ref="formEditRef"
                @submit.prevent="validateEdit"
              >
                <v-text-field
                  v-model="itemEdit.titleEdit"
                  :label="
                    itemEdit && itemEdit.title === $t('HeuristicsTable.titles.editHeuristic')
                      ? $t('HeuristicsTable.placeholders.titleHeuristic')
                      : $t('HeuristicsTable.placeholders.titleQuestion')
                  "
                  variant="outlined"
                  density="comfortable"
                  :rules="itemEdit ? itemEdit.rule : []"
                  autofocus
                />
              </v-form>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-spacer />
              <v-btn
                variant="text"
                @click="closeDialog('dialogEdit')"
              >
                {{ $t('HeuristicsTable.titles.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                @click="validateEdit"
              >
                {{ $t('HeuristicsTable.titles.ok') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import AddDescBtn from '@/components/atoms/AddDescBtn'
import TextClamp from 'vue3-text-clamp'

const emit = defineEmits(['change'])
const store = useStore()
const { t } = useI18n()
const toast = useToast()

const itemSelect = ref(null)
const questionSelect = ref(null)
const itemEdit = ref(null)
const newQuestion = ref(null)
const heuristicForm = ref(null)
const search = ref('')
const dialogEdit = ref(false)
const dialogHeuris = ref(false)
const dialogQuestion = ref(false)
const formEditRef = ref(null)
const formQuestionRef = ref(null)
const formHeurisRef = ref(null)
const descBtn = ref(null)

const headers = ref([
  {
    title: t('HeuristicsTable.titles.title'),
    align: 'start',
    value: 'title',
  },
  { title: t('HeuristicsTable.titles.actions'), value: 'actions', align: 'end', sortable: false },
])

const nameRequired = ref([
  (v) => !!v || t('HeuristicsTable.validation.nameRequired'),
])
const questionRequired = ref([
  (v) => !!v || t('HeuristicsTable.validation.questionRequired'),
])

const heuristics = computed(() =>
  store.state.Tests.Test.testStructure ? store.state.Tests.Test.testStructure : []
)

const filteredHeuristics = computed(() => {
  const searchLower = search.value.toLowerCase()
  return heuristics.value.filter((item) => {
    const idString = item.id.toString()
    return (
      item.title.toLowerCase().includes(searchLower) ||
      idString.includes(searchLower) ||
      idString === searchLower
    )
  })
})

const testAnswerDocLength = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return 0
  }
  const heuristicAnswers = store.getters.testAnswerDocument.heuristicAnswers
  return Object.keys(heuristicAnswers).length
})

watch(dialogHeuris, (newVal) => {
  if (!newVal && heuristics.value.length > 0 && !itemEdit.value) {
    heuristicForm.value = {
      id: heuristics.value[heuristics.value.length - 1].id + 1,
      title: '',
      total: 0,
      questions: [
        {
          id: 0,
          title: '',
          comparison: [],
          descriptions: [],
        },
      ],
    }
    heuristicForm.value.total = heuristicForm.value.questions.length
  }
  if (newVal && formHeurisRef.value) {
    formHeurisRef.value.resetValidation()
    formHeurisRef.value.reset()
  }
})

watch(itemSelect, (newVal) => {
  if (newVal !== null) {
    questionSelect.value = null
  } else {
    itemSelect.value = null
  }
})

onMounted(() => {
  if (heuristics.value.length) {
    heuristicForm.value = {
      id: heuristics.value[heuristics.value.length - 1].id + 1,
      total: 0,
      title: '',
      questions: [
        {
          id: 0,
          title: '',
          descriptions: [],
          comparison: [],
        },
      ],
    }
  } else {
    heuristicForm.value = {
      id: 0,
      total: 0,
      title: '',
      questions: [
        {
          id: 0,
          title: '',
          descriptions: [],
          comparison: [],
        },
      ],
    }
  }
  heuristicForm.value.total = heuristicForm.value.questions.length
})

const toggleHeuristic = (index) => {
  itemSelect.value = itemSelect.value === index ? null : index
}

const moveItemUp = (index) => {
  if (index > 0) {
    const itemToMove = filteredHeuristics.value[index]
    const itemAbove = filteredHeuristics.value[index - 1]

    filteredHeuristics.value[index] = itemAbove
    filteredHeuristics.value[index - 1] = itemToMove

    itemToMove.id = index - 1
    itemAbove.id = index

    heuristics.value[index] = itemAbove
    heuristics.value[index - 1] = itemToMove

    itemToMove.id = index - 1
    itemAbove.id = index

    toast.warning(t('HeuristicsTable.messages.changeWeights'))
    emit('change')
  }
}

const moveItemDown = (index) => {
  if (index < filteredHeuristics.value.length - 1) {
    const itemToMove = filteredHeuristics.value[index]
    const itemBelow = filteredHeuristics.value[index + 1]

    filteredHeuristics.value[index] = itemBelow
    filteredHeuristics.value[index + 1] = itemToMove

    itemToMove.id = index + 1
    itemBelow.id = index

    heuristics.value[index] = itemBelow
    heuristics.value[index + 1] = itemToMove

    itemToMove.id = index + 1
    itemBelow.id = index

    toast.warning(t('HeuristicsTable.messages.changeWeights'))
    emit('change')
  }
}

const deleteHeuristic = (index) => {
  const config = confirm(
    `${t('alerts.deleteHeuristic')} ${heuristics.value[index].title}?`
  )

  if (config) {
    store.commit('removeHeuristic', index)
    itemSelect.value = null
    questionSelect.value = null
    emit('change')
  }
}

const deleteQuestion = (qIndex) => {
  if (heuristics.value[itemSelect.value].questions.length > 1) {
    const config = confirm(
      `${t('alerts.deleteQuestion')} ${heuristics.value[itemSelect.value].questions[qIndex].title}?`
    )

    if (config) {
      heuristics.value[itemSelect.value].questions.splice(qIndex, 1)
      questionSelect.value = null
      heuristics.value[itemSelect.value].total = heuristics.value[itemSelect.value].questions.length
      emit('change')
    }
  } else {
    toast.warning(t('HeuristicsTable.messages.cantDeleteAllQuestions'))
  }
}

const editHeuris = (item) => {
  itemEdit.value = {
    title: t('HeuristicsTable.titles.editHeuristic'),
    titleEdit: item.title,
    rule: nameRequired.value,
    id: item.id,
  }
  dialogEdit.value = true
}

const editQuestions = (item) => {
  itemEdit.value = {
    title: t('HeuristicsTable.titles.editQuestion'),
    titleEdit: item.title,
    rule: questionRequired.value,
  }
  dialogEdit.value = true
}

const editDescription = (desc) => {
  const ind = heuristics.value[itemSelect.value].questions[questionSelect.value].descriptions.indexOf(desc)
  descBtn.value.editSetup(ind)
}

const setupQuestion = (heuristicId) => {
  newQuestion.value = {
    id: heuristics.value[itemSelect.value].questions[
      heuristics.value[itemSelect.value].questions.length - 1
    ].id + 1,
    title: '',
    descriptions: [],
  }
  dialogQuestion.value = true
}

const deleteItem = (item) => {
  heuristics.value[itemSelect.value].questions[questionSelect.value].descriptions.splice(
    heuristics.value[itemSelect.value].questions[questionSelect.value].descriptions.indexOf(item),
    1
  )
  emit('change')
}

const addHeuris = () => {
  if (formHeurisRef.value.validate()) {
    dialogHeuris.value = false
    heuristics.value.push({ ...heuristicForm.value })
    itemSelect.value = heuristics.value.length - 1
    heuristics.value.total = heuristics.value.reduce((sum, h) => sum + h.total, 0)
    formHeurisRef.value.resetValidation()
    emit('change')
  }
}

const closeDialog = (dialogName) => {
  if (dialogName === 'dialogHeuris' && formHeurisRef.value) {
    formHeurisRef.value.resetValidation()
    formHeurisRef.value.reset()
  }
  if (dialogName === 'dialogQuestion' && formQuestionRef.value) {
    formQuestionRef.value.resetValidation()
    formQuestionRef.value.reset()
    newQuestion.value = null
  }
  if (dialogName === 'dialogEdit' && formEditRef.value) {
    formEditRef.value.resetValidation()
    formEditRef.value.reset()
    itemEdit.value = null
  }

  if (dialogName === 'dialogHeuris') dialogHeuris.value = false
  else if (dialogName === 'dialogQuestion') dialogQuestion.value = false
  else if (dialogName === 'dialogEdit') dialogEdit.value = false
}

const addQuestion = () => {
  if (formQuestionRef.value.validate()) {
    dialogQuestion.value = false
    heuristics.value[itemSelect.value].questions.push(newQuestion.value)
    newQuestion.value = null
    heuristics.value[itemSelect.value].total = heuristics.value[itemSelect.value].questions.length
    formQuestionRef.value.resetValidation()
    emit('change')
  }
}

const validateEdit = () => {
  if (formEditRef.value.validate()) {
    dialogEdit.value = false
    if (itemEdit.value.title === t('HeuristicsTable.titles.editHeuristic')) {
      heuristics.value[itemSelect.value].title = itemEdit.value.titleEdit
    } else {
      heuristics.value[itemSelect.value].questions[questionSelect.value].title = itemEdit.value.titleEdit
    }
    itemEdit.value = null
    emit('change')
  }
}

const updateDescription = () => {
  emit('change')
}
</script>

<style scoped>
.heuristic-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.heuristic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.heuristic-card.expanded {
  border-color: #3B82F6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
}

.questions-list {
  width: 100%;
}

.question-card {
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.question-card:hover {
  border-color: #3B82F6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.v-field--variant-outlined) {
  --v-field-border-width: 1px;
}

:deep(.v-btn--variant-elevated) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.v-btn--variant-elevated:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>