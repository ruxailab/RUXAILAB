<template>
  <v-card elevation="2" class="pa-6">
    <!-- Header Section -->
    <div class="d-flex align-center justify-space-between mb-8 mobile-header">
      <div>
        <h1 class="text-h4 font-weight-bold text-on-surface">
          {{ $t('HeuristicsTable.titles.currentHeuristics') }}
        </h1>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        variant="elevated"
        size="large"
        :disabled="testAnswerDocLength > 0"
        class="text-none add-heuristic-btn"
        @click="dialogHeuris = true"
      >
        {{ $t('HeuristicsTable.titles.addNewHeuristic') }}
      </v-btn>
    </div>

    <!-- Search Row -->
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          :label="$t('HeuristicsTable.titles.searchHeuristics')"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="search-field"
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
          class="heuristic-card"
          :class="{ expanded: itemSelect === index }"
        >
          <!-- Heuristic Header -->
          <v-card-title class="d-flex align-center pa-4 heuristic-header">
            <v-btn
              :icon="
                itemSelect === index ? 'mdi-chevron-up' : 'mdi-chevron-down'
              "
              variant="text"
              size="small"
              class="me-3 toggle-btn"
              @click="toggleHeuristic(index)"
            />

            <div class="flex-grow-1 heuristic-info">
              <h3
                class="text-h6 font-weight-medium text-on-surface heuristic-title"
              >
                {{ heuristic.id + 1 }} - {{ heuristic.title }}
              </h3>
              <p class="text-body-2 text-ternary ma-0 mt-1 question-count">
                {{ heuristic.questions.length }}
                {{ $t('HeuristicsTable.titles.questions') }}
              </p>
            </div>

            <div class="d-flex gap-2 heuristic-actions">
              <v-btn
                icon="mdi-arrow-up"
                variant="text"
                size="small"
                color="accent"
                :disabled="index === 0 || testAnswerDocLength > 0"
                class="action-btn"
                @click="moveItemUp(index)"
              >
                <v-icon>mdi-arrow-up</v-icon>
                <v-tooltip activator="parent" location="top">
                  {{ $t('HeuristicsTable.titles.moveUp') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon="mdi-arrow-down"
                variant="text"
                size="small"
                color="accent"
                :disabled="
                  index === filteredHeuristics.length - 1 ||
                  testAnswerDocLength > 0
                "
                class="action-btn"
                @click="moveItemDown(index)"
              >
                <v-icon>mdi-arrow-down</v-icon>
                <v-tooltip activator="parent" location="top">
                  {{ $t('HeuristicsTable.titles.moveDown') }}
                </v-tooltip>
              </v-btn>
              <v-btn
                icon="mdi-plus"
                variant="text"
                size="small"
                color="accent"
                :disabled="testAnswerDocLength > 0"
                class="action-btn"
                @click="setupQuestion(index)"
              >
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">
                  {{ $t('HeuristicsTable.titles.addNewQuestion') }}
                </v-tooltip>
              </v-btn>
              <span>
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="primary"
                  :disabled="testAnswerDocLength > 0"
                  class="action-btn"
                  @click="editHeuris(heuristic)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-tooltip activator="parent" location="top">
                  <template v-if="testAnswerDocLength > 0">
                    This study has answers
                  </template>
                  <template v-else>
                    {{ $t('HeuristicsTable.titles.editHeuristic') }}
                  </template>
                </v-tooltip>
              </span>
              <span>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  :disabled="testAnswerDocLength > 0"
                  class="action-btn"
                  @click="deleteHeuristic(index)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-tooltip activator="parent" location="top">
                  <template v-if="testAnswerDocLength > 0">
                    This study has answers
                  </template>
                  <template v-else>
                    {{ $t('HeuristicsTable.titles.deleteHeuristic') }}
                  </template>
                </v-tooltip>
              </span>
            </div>
          </v-card-title>

          <!-- Expanded Content -->
          <v-expand-transition>
            <div v-if="itemSelect === index">
              <v-divider />
              <v-card-text class="pa-4">
                <!-- Updated Questions Header - Matches heuristic header style -->
                <div class="d-flex align-center mb-4 questions-header">
                  <div class="flex-grow-1">
                    <h4 class="text-h6 font-weight-medium text-on-surface">
                      {{ $t('HeuristicsTable.titles.questions') }}
                    </h4>
                  </div>
                  <v-chip
                    :color="
                      heuristic.questions.length > 0 ? 'success' : 'warning'
                    "
                    variant="tonal"
                    size="small"
                    class="ms-2"
                  >
                    {{ heuristic.questions.length }}
                    {{
                      heuristic.questions.length === 1
                        ? $t('HeuristicsTable.count.question')
                        : $t('HeuristicsTable.count.questions')
                    }}
                  </v-chip>
                </div>

                <!-- Questions Grid - UPDATED STRUCTURE -->
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
                    <!-- Question Header - EXACTLY LIKE HEURISTIC HEADER -->
                    <div class="d-flex align-center pa-3 question-header">
                      <div
                        class="d-flex align-center flex-grow-1 question-info"
                      >
                        <v-chip
                          color="primary"
                          variant="tonal"
                          size="small"
                          class="me-3 question-chip"
                        >
                          Q{{ qIndex + 1 }}
                        </v-chip>
                        <div>
                          <h5
                            class="text-subtitle-1 font-weight-medium text-on-surface question-title mb-0"
                          >
                            {{ question.title }}
                          </h5>
                          <!-- Optional: Add question description/subtitle if needed -->
                          <!-- <p class="text-body-2 text-ternary ma-0 mt-1 question-desc">
                                {{ question.description || 'No description' }}
                              </p> -->
                        </div>
                      </div>

                      <div class="d-flex gap-1 question-actions">
                        <v-btn
                          icon="mdi-pencil"
                          variant="text"
                          size="small"
                          color="primary"
                          class="action-btn"
                          @click.stop="editQuestions(question)"
                        />
                        <v-btn
                          icon="mdi-delete"
                          variant="text"
                          size="small"
                          color="error"
                          :disabled="testAnswerDocLength > 0"
                          class="action-btn"
                          @click.stop="deleteQuestion(qIndex)"
                        />
                      </div>
                    </div>

                    <!-- Question Expanded Content (for descriptions) -->
                    <v-expand-transition>
                      <div v-if="questionSelect === qIndex">
                        <v-divider />
                        <!-- Descriptions Section - UPDATED FOR RESPONSIVENESS -->
                        <v-card class="mt-3 mx-3 mb-2 description-card">
                          <v-card-text class="pa-3">
                            <div
                              class="d-flex align-center justify-space-between mb-3 description-header"
                            >
                              <h4 class="text-h6 text-on-surface mb-0">
                                {{ $t('HeuristicsTable.titles.descriptions') }}
                              </h4>
                              <!-- Updated Add Description Button -->
                              <AddDescBtn
                                :ref="(el) => (descBtn[index] = el)"
                                :question-index="questionSelect"
                                :heuristic-index="itemSelect"
                                class="add-desc-btn"
                                @update-description="updateDescription"
                              />
                            </div>

                            <!-- Responsive Data Table -->
                            <div class="responsive-table-wrapper">
                              <v-data-table
                                :headers="headers"
                                :items="
                                  Array.isArray(
                                    heuristic.questions[questionSelect]
                                      ?.descriptions,
                                  )
                                    ? heuristic.questions[questionSelect]
                                        .descriptions
                                    : Object.values(
                                        heuristic.questions[questionSelect]
                                          ?.descriptions || {},
                                      )
                                "
                                :items-per-page="5"
                                class="elevation-0 description-table"
                                hide-default-footer
                              >
                                <template #item.title="{ item }">
                                  <div class="description-title">
                                    {{ item.title || 'No title' }}
                                  </div>
                                </template>
                                <template #item.actions="{ item }">
                                  <div class="description-actions">
                                    <v-btn
                                      icon
                                      size="small"
                                      variant="text"
                                      color="primary"
                                      class="table-action-btn"
                                      @click="editDescription(item)"
                                    >
                                      <v-icon size="small"> mdi-pencil </v-icon>
                                    </v-btn>
                                    <v-btn
                                      icon
                                      size="small"
                                      variant="text"
                                      color="error"
                                      class="table-action-btn"
                                      @click="deleteItem(item)"
                                    >
                                      <v-icon size="small"> mdi-delete </v-icon>
                                    </v-btn>
                                  </div>
                                </template>
                                <template #no-data>
                                  <div class="text-center py-4 no-data-message">
                                    <v-icon
                                      icon="mdi-text-box-remove-outline"
                                      size="48"
                                      color="grey-lighten-1"
                                      class="mb-2"
                                    />
                                    <p class="text-body-2 text-grey">
                                      {{
                                        $t(
                                          'HeuristicsTable.messages.noDescriptions',
                                        )
                                      }}
                                    </p>
                                  </div>
                                </template>
                              </v-data-table>

                              <!-- Custom Pagination for better mobile control -->
                              <div
                                v-if="
                                  heuristic.questions[questionSelect]
                                    ?.descriptions?.length > 0
                                "
                                class="custom-pagination"
                              >
                                <div
                                  class="d-flex align-center justify-space-between flex-wrap gap-2 pa-2"
                                >
                                  <div
                                    class="d-flex align-center items-per-page"
                                  >
                                    <span class="text-caption text-grey mr-2">
                                      {{ $t('common.itemsPerPage') }}
                                    </span>
                                    <v-select
                                      :items="[3, 5, 10, 20]"
                                      :model-value="5"
                                      density="compact"
                                      variant="outlined"
                                      hide-details
                                      class="items-select"
                                      @update:model-value="handleItemsPerPage"
                                    />
                                  </div>
                                  <div
                                    class="pagination-info text-caption text-grey"
                                  >
                                    {{
                                      getPaginationInfo(
                                        heuristic.questions[questionSelect]
                                          ?.descriptions?.length || 0,
                                      )
                                    }}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </div>
                    </v-expand-transition>
                  </v-card>
                </div>

                <!-- Empty State for Questions -->
                <v-card
                  v-else
                  variant="outlined"
                  class="text-center pa-8 empty-questions"
                  style="border-style: dashed"
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
                  <p class="text-body-2 text-secondary mb-4 empty-state-text">
                    {{ $t('HeuristicsTable.messages.startAddingQuestions') }}
                  </p>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-plus"
                    :disabled="testAnswerDocLength > 0"
                    @click="setupQuestion(index)"
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
        <v-card class="text-center py-16 empty-heuristics" variant="outlined">
          <v-icon
            icon="mdi-clipboard-text-outline"
            size="64"
            color="grey-darken-1"
            class="mb-4"
          />
          <h3 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">
            {{ $t('HeuristicsTable.titles.noHeuristicsFound') }}
          </h3>
          <p class="text-body-1 text-grey-darken-1">
            {{ $t('HeuristicsTable.messages.noHeuristics') }}
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Heuristic Dialog -->
    <v-dialog v-model="dialogHeuris" max-width="600" persistent>
      <v-card>
        <v-card-title
          class="text-h5 pa-6"
          style="background-color: #00213f; color: white"
        >
          {{ $t('HeuristicsTable.titles.creatingHeuristic') }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="formHeurisRef" @keyup.enter="addHeuris">
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
          <v-btn variant="text" @click="closeDialog('dialogHeuris')">
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="addHeuris">
            {{ $t('HeuristicsTable.titles.add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Question Dialog -->
    <v-dialog v-model="dialogQuestion" max-width="600" persistent>
      <v-card>
        <v-card-title
          class="text-h5 pa-6"
          style="background-color: #fca326; color: white"
        >
          {{ $t('HeuristicsTable.titles.newQuestion') }}
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <v-form ref="formQuestionRef" @submit.prevent="addQuestion">
            <v-text-field
              v-if="dialogQuestion && newQuestion"
              v-model="newQuestion.title"
              :label="$t('HeuristicsTable.placeholders.titleNewQuestion')"
              variant="outlined"
              density="comfortable"
              :rules="questionRequired"
              autofocus
            />
            <v-alert v-else-if="dialogQuestion" type="error" class="mt-4">
              {{ $t('HeuristicsTable.errors.failedToLoadQuestionForm') }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog('dialogQuestion')">
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!newQuestion"
            @click="addQuestion"
          >
            {{ $t('HeuristicsTable.titles.add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Heuristic/Question Dialog -->
    <v-dialog v-model="dialogEdit" max-width="600" persistent>
      <v-card>
        <v-card-title
          class="text-h5 pa-6"
          style="background-color: #fca326; color: white"
        >
          {{
            itemEdit && !isDialogClosing
              ? itemEdit.title
              : $t('HeuristicsTable.titles.loading')
          }}
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <v-form ref="formEditRef" @submit.prevent="validateEdit">
            <v-text-field
              v-if="itemEdit && !isDialogClosing"
              v-model="itemEdit.titleEdit"
              :label="
                itemEdit &&
                itemEdit.title === $t('HeuristicsTable.titles.editHeuristic')
                  ? $t('HeuristicsTable.placeholders.titleHeuristic')
                  : $t('HeuristicsTable.placeholders.titleQuestion')
              "
              variant="outlined"
              density="comfortable"
              :rules="itemEdit ? itemEdit.rule : []"
              autofocus
            />
            <v-alert v-else-if="dialogEdit" type="error" class="mt-4">
              {{ $t('HeuristicsTable.errors.failedToLoadEditForm') }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="isProcessing"
            @click="closeDialog('dialogEdit')"
          >
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="isProcessing || !itemEdit || isDialogClosing"
            @click="validateEdit"
          >
            {{ $t('HeuristicsTable.titles.ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Custom confirmation dialog -->
    <v-dialog v-model="dialogDelete" max-width="500px" persistent>
      <v-card class="pa-4 rounded-lg">
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon color="warning" class="me-3" size="32"
            >mdi-alert-circle</v-icon
          >
          {{ $t('common.confirm_deletion') }}
        </v-card-title>
        <v-card-text class="text-body-1 pt-4 pb-6">
          {{ deleteMessage }}
          <div class="mt-4 text-body-2 text-ternary" style="opacity: 0.8">
            {{ $t('common.action_cannot_be_undone') }}
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            rounded="lg"
            class="text-none px-6"
            @click="dialogDelete = false"
          >
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            rounded="lg"
            class="text-none px-6 shadow-sm"
            @click="confirmDeleteAction"
          >
            {{ $t('HeuristicsTable.titles.ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import AddDescBtn from '@/ux/Heuristic/components/AddDescBtn.vue'
import { showError, showWarning } from '@/shared/utils/toast'

const emit = defineEmits(['change'])
const store = useStore()
const { t } = useI18n()

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
const descBtn = ref([])
const isProcessing = ref(false)
const questionHeuristicIndex = ref(null)
const itemsPerPage = ref(5)
const isDialogClosing = ref(false)

// Delete confirmation dialog state
const dialogDelete = ref(false)
const deleteAction = ref(null)
const deleteMessage = ref('')

const headers = ref([
  {
    title: t('HeuristicsTable.titles.titles'),
    align: 'start',
    value: 'title',
    width: '70%',
  },
  {
    title: t('HeuristicsTable.titles.actions'),
    value: 'actions',
    align: 'end',
    sortable: false,
    width: '30%',
  },
])

const nameRequired = ref([
  (v) => !!v || t('HeuristicsTable.validation.nameRequired'),
])
const questionRequired = ref([
  (v) => !!v || t('HeuristicsTable.validation.questionRequired'),
])

const test = computed(() => store.getters.test)

const heuristics = computed(() => {
  const source = store.getters.heuristics?.length
    ? store.getters.heuristics
    : store.state.Tests?.Test.testStructure || []

  return Array.isArray(source)
    ? source.map((h) => ({
        ...h,
        questions: Array.isArray(h.questions)
          ? h.questions.map((q) => ({
              ...q,
              descriptions: Array.isArray(q.descriptions)
                ? q.descriptions
                : Object.values(q.descriptions || {}),
            }))
          : [],
      }))
    : []
})

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
  return Object.keys(store.getters.testAnswerDocument?.heuristicAnswers ?? {})
    .length
})
const getPaginationInfo = (totalItems) => {
  const page = 1
  const start = (page - 1) * itemsPerPage.value + 1
  const end = Math.min(page * itemsPerPage.value, totalItems)
  return `${start}-${end} of ${totalItems}`
}

const handleItemsPerPage = (value) => {
  itemsPerPage.value = value
}

watch(dialogHeuris, (newVal) => {
  if (!newVal && heuristics.value.length > 0 && !itemEdit.value) {
    heuristicForm.value = {
      id: heuristics.value[heuristics.value.length - 1].id + 1,
      title: '',
      total: 0,
      questions: [{ id: 0, title: '', comparison: [], descriptions: [] }],
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
  }
})

onMounted(() => {
  heuristicForm.value = {
    id: heuristics.value.length
      ? heuristics.value[heuristics.value.length - 1].id + 1
      : 0,
    total: 0,
    title: '',
    questions: [{ id: 0, title: '', descriptions: [], comparison: [] }],
  }
  store.commit('SET_HEURISTICS', heuristics.value)
  heuristicForm.value.total = heuristicForm.value.questions.length
})

const toggleHeuristic = (index) => {
  itemSelect.value = itemSelect.value === index ? null : index
}

const moveItemUp = (index) => {
  if (index > 0) {
    const newHeuristics = [...heuristics.value]
    const itemToMove = newHeuristics[index]
    const itemAbove = newHeuristics[index - 1]

    newHeuristics[index] = itemAbove
    newHeuristics[index - 1] = itemToMove

    itemToMove.id = index - 1
    itemAbove.id = index

    store.dispatch('setHeuristics', newHeuristics)
    showWarning('HeuristicsTable.messages.changeWeights')
    emit('change')
  }
}

const moveItemDown = (index) => {
  if (index < filteredHeuristics.value.length - 1) {
    const newHeuristics = [...heuristics.value]
    const itemToMove = newHeuristics[index]
    const itemBelow = newHeuristics[index + 1]

    newHeuristics[index] = itemBelow
    newHeuristics[index + 1] = itemToMove

    itemToMove.id = index + 1
    itemBelow.id = index

    store.dispatch('setHeuristics', newHeuristics)
    showWarning('HeuristicsTable.messages.changeWeights')
    emit('change')
  }
}

const deleteHeuristic = (index) => {
  deleteMessage.value = `${t('alerts.deleteHeuristic')} "${
    heuristics.value[index].title
  }"?`
  deleteAction.value = () => {
    store.commit('REMOVE_HEURISTIC', index)
    itemSelect.value = null
    questionSelect.value = null
    emit('change')
  }
  dialogDelete.value = true
}

const deleteQuestion = (qIndex) => {
  if (heuristics.value[itemSelect.value].questions.length > 1) {
    deleteMessage.value = `${t('alerts.deleteQuestion')} "${
      heuristics.value[itemSelect.value].questions[qIndex].title
    }"?`
    deleteAction.value = () => {
      const newHeuristics = [...heuristics.value]
      newHeuristics[itemSelect.value].questions.splice(qIndex, 1)
      newHeuristics[itemSelect.value].total =
        newHeuristics[itemSelect.value].questions.length
      store.dispatch('setHeuristics', newHeuristics)
      questionSelect.value = null
      emit('change')
    }
    dialogDelete.value = true
  } else {
    showWarning('HeuristicsTable.messages.cantDeleteAllQuestions')
  }
}

const confirmDeleteAction = () => {
  if (deleteAction.value) {
    deleteAction.value()
  }
  dialogDelete.value = false
  deleteAction.value = null
}

const editHeuris = (item) => {
  const heuristicIndex = heuristics.value.findIndex((h) => h.id === item.id)
  if (heuristicIndex === -1) {
    showError(t('HeuristicsTable.errors.invalidHeuristic'))
    return
  }
  itemEdit.value = {
    title: t('HeuristicsTable.titles.editHeuristic'),
    titleEdit: item.title || '',
    rule: nameRequired.value,
    id: item.id,
  }
  itemSelect.value = heuristicIndex
  dialogEdit.value = true
}

const editQuestions = (item) => {
  if (itemSelect.value == null || !heuristics.value[itemSelect.value]) {
    showError('HeuristicsTable.errors.invalidHeuristic')
    return
  }
  itemEdit.value = {
    title: t('HeuristicsTable.titles.editQuestion'),
    titleEdit: item.title || '',
    rule: questionRequired.value,
    id: item.id,
  }
  dialogEdit.value = true
}

const editDescription = (desc) => {
  const ind =
    heuristics.value[itemSelect.value].questions[
      questionSelect.value
    ].descriptions.indexOf(desc)
  const btn = descBtn.value[itemSelect.value]
  if (btn && typeof btn.editSetup === 'function') {
    btn.editSetup(ind)
  } else {
  }
}

const setupQuestion = (heuristicIndex) => {
  if (!heuristics.value[heuristicIndex]) {
    showError('HeuristicsTable.errors.invalidHeuristic')
    return
  }
  questionHeuristicIndex.value = heuristicIndex // remember index
  const questions = heuristics.value[heuristicIndex].questions || []
  const lastQuestionId =
    questions.length > 0 ? questions[questions.length - 1].id : -1
  newQuestion.value = {
    id: lastQuestionId + 1,
    title: '',
    descriptions: [],
    comparison: [],
  }
  dialogQuestion.value = true
}

const deleteItem = (item) => {
  deleteMessage.value = `${t('alerts.deleteDescription')} "${
    item.title || 'this description'
  }"?`
  deleteAction.value = () => {
    const newHeuristics = [...heuristics.value]
    const questions =
      newHeuristics[itemSelect.value].questions[questionSelect.value]
    const index = questions.descriptions.indexOf(item)
    if (index !== -1) {
      questions.descriptions.splice(index, 1)
      store.dispatch('setHeuristics', newHeuristics)
      emit('change')
    }
  }
  dialogDelete.value = true
}

const addHeuris = () => {
  if (formHeurisRef.value.validate()) {
    dialogHeuris.value = false
    const newHeuristics = [...heuristics.value, { ...heuristicForm.value }]
    store.dispatch('setHeuristics', newHeuristics)
    itemSelect.value = newHeuristics.length - 1
    formHeurisRef.value.resetValidation()
    emit('change')
  }
}

const closeDialog = (dialogName) => {
  if (isProcessing.value) return
  if (dialogName === 'dialogHeuris') {
    if (formHeurisRef.value) {
      formHeurisRef.value.resetValidation()
      formHeurisRef.value.reset()
    }
    dialogHeuris.value = false
  } else if (dialogName === 'dialogQuestion') {
    dialogQuestion.value = false
    setTimeout(() => {
      if (formQuestionRef.value) {
        formQuestionRef.value.resetValidation()
        formQuestionRef.value.reset()
      }
      newQuestion.value = null
      questionHeuristicIndex.value = null
    }, 150)
  } else if (dialogName === 'dialogEdit') {
    isDialogClosing.value = true
    if (formEditRef.value) {
      formEditRef.value.resetValidation()
      formEditRef.value.reset()
    }
    dialogEdit.value = false
    setTimeout(() => {
      isDialogClosing.value = false
      itemEdit.value = null
    }, 300)
  }
}

const addQuestion = () => {
  if (!newQuestion.value || questionHeuristicIndex.value === null) {
    showError('HeuristicsTable.errors.invalidHeuristic')
    return
  }
  if (formQuestionRef.value.validate()) {
    try {
      const newHeuristics = [...heuristics.value]
      newHeuristics[questionHeuristicIndex.value].questions.push({
        ...newQuestion.value,
      })
      newHeuristics[questionHeuristicIndex.value].total =
        newHeuristics[questionHeuristicIndex.value].questions.length
      store.dispatch('setHeuristics', newHeuristics)
      closeDialog('dialogQuestion')
      emit('change')
    } catch {
      showError('HeuristicsTable.errors.failedToLoadQuestionForm')
    }
  }
}

const validateEdit = () => {
  if (isProcessing.value) {
    return
  }
  if (!itemEdit.value) {
    dialogEdit.value = false
    return
  }
  if (itemSelect.value == null || !heuristics.value[itemSelect.value]) {
    dialogEdit.value = false
    showError('HeuristicsTable.errors.invalidHeuristic')
    return
  }
  isProcessing.value = true

  if (formEditRef.value.validate()) {
    const newHeuristics = [...heuristics.value]
    if (itemEdit.value.title === t('HeuristicsTable.titles.editHeuristic')) {
      newHeuristics[itemSelect.value].title = itemEdit.value.titleEdit
    } else {
      const questionIndex = newHeuristics[itemSelect.value].questions.findIndex(
        (q) => q.id === itemEdit.value.id,
      )
      if (questionIndex !== -1) {
        newHeuristics[itemSelect.value].questions[questionIndex].title =
          itemEdit.value.titleEdit
      } else {
        showError('HeuristicsTable.errors.invalidQuestion')
      }
    }
    store.dispatch('setHeuristics', newHeuristics)
    emit('change')
    dialogEdit.value = false
    nextTick(() => {
      dialogEdit.value = false
      isProcessing.value = false
    })
  } else {
    isProcessing.value = false
  }
}

const updateDescription = () => {
  emit('change')
}
</script>

<style scoped>
/* Responsive styles for mobile devices */
@media (max-width: 768px) {
  /* Make header section stack vertically */
  .mobile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px !important;
  }

  /* Make add heuristic button full width on mobile */
  .add-heuristic-btn {
    width: 100%;
  }

  /* Adjust title size on mobile */
  .text-h4.font-weight-bold.text-on-surface {
    font-size: 1.75rem !important;
    line-height: 1.2;
  }

  /* Make heuristic header more compact on mobile */
  .heuristic-header {
    flex-wrap: wrap;
    padding: 12px !important;
    align-items: center !important;
  }

  /* Make action buttons wrap properly */
  .heuristic-actions {
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
    width: 100%;
    justify-content: flex-end;
  }

  /* Make action buttons smaller on mobile */
  .action-btn {
    min-width: 36px !important;
    width: 36px !important;
    height: 36px !important;
  }

  /* Adjust heuristic info for mobile */
  .heuristic-info {
    min-width: 100%;
    margin-bottom: 8px;
  }

  .heuristic-title {
    font-size: 1.1rem !important;
    line-height: 1.3;
  }

  .question-count {
    font-size: 0.875rem !important;
  }

  /* Reduce padding on smaller screens */
  .v-container.fluid.pa-6,
  .v-card.pa-6 {
    padding: 16px !important;
  }

  /* Question header - matches heuristic header exactly */
  .question-header {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    padding: 12px !important;
    width: 100%;
  }

  .question-info {
    display: flex !important;
    align-items: center !important;
    flex-grow: 1;
    min-width: 0;
    min-width: 100%;
    margin-bottom: 8px;
  }

  .question-chip {
    flex-shrink: 0 !important;
    margin-right: 12px !important;
    background-color: rgba(var(--v-theme-primary), 0.1) !important;
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: 600;
    min-width: 40px !important;
    justify-content: center;
  }

  .question-title {
    font-size: 1rem !important;
    line-height: 1.3;
    word-break: break-word;
    overflow-wrap: break-word;
    flex-grow: 1;
    min-width: 0;
  }

  /* Question actions exactly like heuristic actions */
  .question-actions {
    display: flex !important;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    justify-content: flex-end;
    margin-top: 0;
  }

  /* Make questions header stack like heuristic header on mobile */
  .questions-header {
    flex-wrap: wrap;
    padding: 0 0 16px 0 !important;
    align-items: center;
  }

  .questions-header .flex-grow-1 {
    min-width: 100%;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .questions-header .v-chip {
    align-self: center;
    margin-left: 0 !important;
    background-color: rgba(var(--v-theme-primary), 0.1) !important;
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: 600;
  }

  /* Responsive Descriptions Section */
  .description-card {
    margin: 12px 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }

  .description-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 12px !important;
    margin-bottom: 16px !important;
  }

  .description-header h4 {
    margin-bottom: 0 !important;
    font-size: 1.1rem !important;
    width: 100%;
  }

  .add-desc-btn {
    width: 100% !important;
  }

  .add-desc-btn :deep(.v-btn) {
    width: 100% !important;
    justify-content: center;
  }

  /* Responsive table wrapper */
  .responsive-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  .description-table :deep(.v-data-table__wrapper) {
    min-width: 400px;
  }

  .description-table :deep(.v-data-table-header) {
    font-size: 0.875rem !important;
    background-color: rgba(0, 0, 0, 0.02);
  }

  .description-table :deep(th),
  .description-table :deep(td) {
    padding: 12px 8px !important;
    font-size: 0.875rem !important;
    white-space: nowrap;
  }

  .description-table :deep(th) {
    font-weight: 600 !important;
    color: rgba(0, 0, 0, 0.87) !important;
  }

  /* Description title with better wrapping */
  .description-title {
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal !important;
    max-width: 250px;
  }

  /* Description actions */
  .description-actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
    flex-wrap: nowrap;
  }

  .table-action-btn {
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
  }

  /* No data message */
  .no-data-message {
    padding: 24px 0 !important;
  }

  .no-data-message .v-icon {
    opacity: 0.5;
  }

  .no-data-message p {
    opacity: 0.7;
    max-width: 80%;
    margin: 0 auto;
  }

  /* Custom pagination */
  .custom-pagination {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    background-color: rgba(0, 0, 0, 0.02);
  }

  .items-per-page {
    flex-wrap: wrap;
    gap: 8px;
  }

  .items-select {
    max-width: 80px;
    min-width: 80px;
  }

  .items-select :deep(.v-field) {
    font-size: 0.75rem !important;
  }

  .pagination-info {
    font-size: 0.75rem !important;
  }

  /* Make empty state cards more compact */
  .empty-questions,
  .empty-heuristics {
    padding: 20px !important;
  }

  /* Fix text wrapping for empty state messages */
  .empty-state-text {
    max-width: 100%;
    word-break: normal;
    word-wrap: break-word;
    hyphens: auto;
    line-height: 1.6;
    padding: 0 8px;
    /* Add responsive font size for mobile */
    font-size: 14px !important;
    margin-bottom: 12px !important;
  }

  /* Make search field better on mobile */
  .search-field :deep(.v-field__prepend-inner) {
    padding-top: 0;
  }

  /* More compact button for mobile */
  .empty-heuristics .v-btn {
    padding-left: 10px !important;
    padding-right: 10px !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
    margin-top: 4px;
    font-size: 13px !important;
    min-height: 38px !important;
    height: auto !important;
    line-height: 1.3 !important;
  }
}

/* Tablet adjustments */
@media (max-width: 960px) and (min-width: 769px) {
  .heuristic-header {
    flex-wrap: wrap;
  }

  .heuristic-actions {
    margin-top: 8px;
    width: 100%;
    justify-content: flex-end;
  }

  /* Make data table more compact on tablet */
  .description-table :deep(.v-data-table-header) {
    font-size: 0.9rem !important;
  }
}

/* Very small mobile screens */
@media (max-width: 480px) {
  /* Further reduce padding */
  .v-container.fluid.pa-6,
  .v-card.pa-6 {
    padding: 12px !important;
  }

  /* Adjust card title padding */
  .v-card-title.pa-4 {
    padding: 12px !important;
  }

  /* Make title even smaller on very small screens */
  .text-h4.font-weight-bold.text-on-surface {
    font-size: 1.5rem !important;
  }

  /* Adjust toggle button */
  .toggle-btn {
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
  }

  /* Better text wrapping for very small screens */
  .empty-state-text {
    font-size: 13px !important; /* Smaller for iPhone */
    line-height: 1.5;
    margin-bottom: 10px !important;
  }

  .empty-heuristics h3.text-h5 {
    font-size: 1.25rem !important;
    margin-bottom: 12px !important;
  }

  /* EXTRA COMPACT button for small screens */
  .empty-heuristics .v-btn {
    padding-left: 8px !important;
    padding-right: 8px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    font-size: 12px !important;
    min-height: 34px !important;
    line-height: 1.2 !important;
    margin-top: 2px;
  }

  /* Reduce empty card padding more */
  .empty-heuristics {
    padding: 16px !important;
  }

  .empty-questions {
    padding: 16px !important;
  }

  /* More compact question layout for small screens - matching heuristic */
  .question-header {
    padding: 10px !important;
  }

  .question-info {
    margin-bottom: 6px;
  }

  .question-title {
    font-size: 0.95rem !important;
    line-height: 1.3;
  }

  .question-chip {
    font-size: 0.75rem !important;
    height: 24px !important;
    min-width: 36px !important;
    margin-right: 8px !important;
  }

  /* Smaller action buttons matching heuristic */
  .question-actions .v-btn {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
  }

  /* Make questions header more compact on small screens */
  .questions-header .flex-grow-1 {
    margin-bottom: 6px;
  }

  .questions-header h4 {
    font-size: 1.1rem !important;
  }

  .questions-header .v-chip {
    font-size: 0.8rem !important;
    height: 24px !important;
  }

  /* Ultra compact descriptions for small screens */
  .description-header {
    gap: 8px !important;
    margin-bottom: 12px !important;
  }

  .description-header h4 {
    font-size: 1rem !important;
  }

  .description-table :deep(.v-data-table__wrapper) {
    min-width: 320px;
  }

  .description-table :deep(.v-data-table-header) {
    font-size: 0.8rem !important;
  }

  .description-table :deep(th),
  .description-table :deep(td) {
    padding: 8px 6px !important;
    font-size: 0.8rem !important;
  }

  .description-title {
    max-width: 180px;
    font-size: 0.8rem !important;
  }

  .table-action-btn {
    min-width: 28px !important;
    width: 28px !important;
    height: 28px !important;
  }

  /* Smaller pagination */
  .items-per-page {
    font-size: 0.75rem !important;
  }

  .items-select {
    max-width: 70px;
    min-width: 70px;
  }

  .pagination-info {
    font-size: 0.7rem !important;
  }
}

@media (max-width: 375px) {
  .empty-state-text {
    font-size: 11px !important;
    line-height: 1.4;
    margin-bottom: 8px !important;
  }

  .empty-heuristics h3.text-h5 {
    font-size: 1rem !important;
    margin-bottom: 10px !important;
  }

  /* ULTRA COMPACT button for very small screens */
  .empty-heuristics .v-btn {
    font-size: 11px !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
    padding-top: 3px !important;
    padding-bottom: 3px !important;
    min-height: 30px !important;
    line-height: 1.1 !important;
    margin-top: 0;
  }

  /* Reduce icon size */
  .empty-heuristics .v-icon {
    font-size: 42px !important;
    height: 42px !important;
    width: 42px !important;
    margin-bottom: 10px !important;
  }

  /* Minimal card padding */
  .empty-heuristics {
    padding: 14px 10px !important;
  }

  /* Ultra compact question layout for iPhone SE - matching heuristic */
  .question-header {
    padding: 8px !important;
  }

  .question-info {
    margin-bottom: 4px;
  }

  .question-title {
    font-size: 0.9rem !important;
    line-height: 1.2;
  }

  .question-chip {
    font-size: 0.7rem !important;
    height: 22px !important;
    min-width: 32px !important;
    margin-right: 6px !important;
  }

  /* Even smaller action buttons matching heuristic */
  .question-actions .v-btn {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
  }

  /* Ultra compact questions header for iPhone SE */
  .questions-header h4 {
    font-size: 1rem !important;
  }

  .questions-header .v-chip {
    font-size: 0.75rem !important;
    height: 22px !important;
  }

  /* Super compact descriptions for iPhone SE */
  .description-header {
    gap: 6px !important;
    margin-bottom: 10px !important;
  }

  .description-header h4 {
    font-size: 0.95rem !important;
  }

  .description-table :deep(.v-data-table__wrapper) {
    min-width: 280px;
  }

  .description-table :deep(.v-data-table-header) {
    font-size: 0.75rem !important;
  }

  .description-table :deep(th),
  .description-table :deep(td) {
    padding: 6px 4px !important;
    font-size: 0.75rem !important;
  }

  .description-title {
    max-width: 150px;
    font-size: 0.75rem !important;
  }

  /* Hide "Title" header text on very small screens */
  .description-table :deep(th:first-child .v-data-table-header__content) {
    font-size: 0;
  }

  .description-table
    :deep(th:first-child .v-data-table-header__content::after) {
    content: 'Title';
    font-size: 0.75rem;
  }

  /* Even smaller table action buttons */
  .table-action-btn {
    min-width: 24px !important;
    width: 24px !important;
    height: 24px !important;
  }

  .table-action-btn :deep(.v-icon) {
    font-size: 16px !important;
  }

  /* Ultra compact pagination */
  .custom-pagination {
    padding: 4px !important;
  }

  .items-per-page {
    font-size: 0.7rem !important;
  }

  .items-select {
    max-width: 60px;
    min-width: 60px;
  }

  .items-select :deep(.v-field) {
    font-size: 0.7rem !important;
    padding: 0 4px !important;
  }

  .pagination-info {
    font-size: 0.65rem !important;
  }

  /* Hide "Items per page" text on very small screens */
  .items-per-page .text-caption {
    display: none;
  }

  .items-per-page .v-select .v-field__input {
    padding: 0 2px !important;
  }
}
</style>
