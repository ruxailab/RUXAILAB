<template>
    <v-container
      fluid
      class="pa-6"
    >
      <v-card
        elevation="2"
        class="pa-6"
      >
        <!-- Header Section -->
        <div class="d-flex align-center justify-space-between mb-8">
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
            class="text-none"
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
                    @click="setupQuestion(index)"
                  >
                    <v-icon>mdi-plus</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >
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
                    @click="editHeuris(heuristic)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-tooltip
                    activator="parent"
                    location="top"
                  >
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
                    @click="deleteHeuristic(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    <v-tooltip
                    activator="parent"
                    location="top"
                  >
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
                              :ref="el => descBtn[index] = el"
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
                  v-if="newQuestion"
                  v-model="newQuestion.title"
                  :label="$t('HeuristicsTable.placeholders.titleNewQuestion')"
                  variant="outlined"
                  density="comfortable"
                  :rules="questionRequired"
                  autofocus
                />
                <v-alert v-else type="error" class="mt-4">
                  {{ $t('HeuristicsTable.errors.failedToLoadQuestionForm') }}
                </v-alert>
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
              <v-btn color="primary" variant="elevated" :disabled="!newQuestion" @click="addQuestion">
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
              {{ itemEdit && !isDialogClosing ? itemEdit.title : $t('HeuristicsTable.titles.loading') }}
            </v-card-title>
            <v-card-text class="pa-6 pt-0">
              <v-form
                ref="formEditRef"
                @submit.prevent="validateEdit"
              >
                <v-text-field
                  v-if="itemEdit && !isDialogClosing"
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
                <v-alert
                  v-else-if="dialogEdit"
                  type="error"
                  class="mt-4"
                >
                  {{ $t('HeuristicsTable.errors.failedToLoadEditForm') }}
                </v-alert>
              </v-form>
            </v-card-text>
            <v-card-actions class="pa-6 pt-0">
              <v-spacer />
              <v-btn
                variant="text"
                @click="closeDialog('dialogEdit')"
                :disabled="isProcessing"
              >
                {{ $t('HeuristicsTable.titles.cancel') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                @click="validateEdit"
                :disabled="isProcessing || !itemEdit || isDialogClosing"
              >
                {{ $t('HeuristicsTable.titles.ok') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-container> 
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import AddDescBtn from '@/ux/Heuristic/components/AddDescBtn.vue';

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
const descBtn = ref([])
const isProcessing = ref(false)
const questionHeuristicIndex = ref(null)

const headers = ref([
  { title: t('HeuristicsTable.titles.title'), align: 'start', value: 'title' },
  { title: t('HeuristicsTable.titles.actions'), value: 'actions', align: 'end', sortable: false },
])

const nameRequired = ref([(v) => !!v || t('HeuristicsTable.validation.nameRequired')]);
const questionRequired = ref([(v) => !!v || t('HeuristicsTable.validation.questionRequired')]);

const test = computed(() => store.getters.test);


const heuristics = computed(() => {
  // 1. Try heuristics getter
  if (store.getters.heuristics && store.getters.heuristics.length) {
    return store.getters.heuristics;
  }
  // 2. Try store.state.Test.test (if it exists and is an array)
  if (store.state.Tests?.Test.testStructure && Array.isArray(store.state.Tests.Test.testStructure)) {
    return store.state.Tests.Test.testStructure;
  }
  // 3. Fallback to empty array
  return [];
});

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
  return Object.keys(store.getters.testAnswerDocument?.heuristicAnswers ?? {}).length;
});

watch(dialogHeuris, (newVal) => {
  if (!newVal && heuristics.value.length > 0 && !itemEdit.value) {
    heuristicForm.value = {
      id: heuristics.value[heuristics.value.length - 1].id + 1,
      title: '',
      total: 0,
      questions: [{ id: 0, title: '', comparison: [], descriptions: [] }],
    };
    heuristicForm.value.total = heuristicForm.value.questions.length;
  }
  if (newVal && formHeurisRef.value) {
    formHeurisRef.value.resetValidation()
    formHeurisRef.value.reset()
  }
})

watch(itemSelect, (newVal) => {
  if (newVal !== null) {
    questionSelect.value = null;
  }
});

onMounted(() => {
  heuristicForm.value = {
    id: heuristics.value.length ? heuristics.value[heuristics.value.length - 1].id + 1 : 0,
    total: 0,
    title: '',
    questions: [{ id: 0, title: '', descriptions: [], comparison: [] }],
  };
  store.commit("SET_HEURISTICS", heuristics.value)
  heuristicForm.value.total = heuristicForm.value.questions.length;
});

const toggleHeuristic = (index) => {
  itemSelect.value = itemSelect.value === index ? null : index
}

const moveItemUp = (index) => {
  if (index > 0) {
    const newHeuristics = [...heuristics.value];
    const itemToMove = newHeuristics[index];
    const itemAbove = newHeuristics[index - 1];

    newHeuristics[index] = itemAbove;
    newHeuristics[index - 1] = itemToMove;

    itemToMove.id = index - 1;
    itemAbove.id = index;

    store.dispatch('setHeuristics', newHeuristics);
    toast.warning(t('HeuristicsTable.messages.changeWeights'));
    emit('change');
  }
}

const moveItemDown = (index) => {
  if (index < filteredHeuristics.value.length - 1) {
    const newHeuristics = [...heuristics.value];
    const itemToMove = newHeuristics[index];
    const itemBelow = newHeuristics[index + 1];

    newHeuristics[index] = itemBelow;
    newHeuristics[index + 1] = itemToMove;

    itemToMove.id = index + 1;
    itemBelow.id = index;

    store.dispatch('setHeuristics', newHeuristics);
    toast.warning(t('HeuristicsTable.messages.changeWeights'));
    emit('change');
  }
};

const deleteHeuristic = (index) => {
  const config = confirm(`${t('alerts.deleteHeuristic')} ${heuristics.value[index].title}?`);
  if (config) {
    store.commit('REMOVE_HEURISTIC', index);
    itemSelect.value = null;
    questionSelect.value = null;
    emit('change');
  }
};

const deleteQuestion = (qIndex) => {
  if (heuristics.value[itemSelect.value].questions.length > 1) {
    const config = confirm(
      `${t('alerts.deleteQuestion')} ${heuristics.value[itemSelect.value].questions[qIndex].title}?`
    );
    if (config) {
      const newHeuristics = [...heuristics.value];
      newHeuristics[itemSelect.value].questions.splice(qIndex, 1);
      newHeuristics[itemSelect.value].total = newHeuristics[itemSelect.value].questions.length;
      store.dispatch('setHeuristics', newHeuristics);
      questionSelect.value = null;
      emit('change');
    }
  } else {
    toast.warning(t('HeuristicsTable.messages.cantDeleteAllQuestions'))
  }
}

const editHeuris = (item) => {
  const heuristicIndex = heuristics.value.findIndex(h => h.id === item.id)
  if (heuristicIndex === -1) {
    console.warn('Heuristic not found:', item);
    toast.error(t('HeuristicsTable.errors.invalidHeuristic'));
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
    console.warn('Invalid heuristic for question edit, itemSelect:', itemSelect.value);
    toast.error(t('HeuristicsTable.errors.invalidHeuristic'));
    return;
  }
  itemEdit.value = {
    title: t('HeuristicsTable.titles.editQuestion'),
    titleEdit: item.title || '',
    rule: questionRequired.value,
    id: item.id,
  };
  dialogEdit.value = true;
};

const editDescription = (desc) => {
  const ind = heuristics.value[itemSelect.value].questions[questionSelect.value].descriptions.indexOf(desc)
  const btn = descBtn.value[itemSelect.value]
  if (btn && typeof btn.editSetup === 'function') {
    btn.editSetup(ind)
  } else {
    console.warn('AddDescBtn ref not ready or missing editSetup method')
  }
}

const setupQuestion = (heuristicIndex) => {
  if (!heuristics.value[heuristicIndex]) {
    toast.error(t('HeuristicsTable.errors.invalidHeuristic'))
    return
  }
  questionHeuristicIndex.value = heuristicIndex  // remember index
  const questions = heuristics.value[heuristicIndex].questions || []
  const lastQuestionId = questions.length > 0 ? questions[questions.length - 1].id : -1
  newQuestion.value = {
    id: lastQuestionId + 1,
    title: '',
    descriptions: [],
    comparison: [],
  }
  dialogQuestion.value = true
}

const deleteItem = (item) => {
  const newHeuristics = [...heuristics.value];
  newHeuristics[itemSelect.value].questions[questionSelect.value].descriptions.splice(
    newHeuristics[itemSelect.value].questions[questionSelect.value].descriptions.indexOf(item),
    1
  );
  store.dispatch('setHeuristics', newHeuristics);
  emit('change');
};

const addHeuris = () => {
  if (formHeurisRef.value.validate()) {
    dialogHeuris.value = false;
    const newHeuristics = [...heuristics.value, { ...heuristicForm.value }];
    store.dispatch('setHeuristics', newHeuristics);
    itemSelect.value = newHeuristics.length - 1;
    formHeurisRef.value.resetValidation();
    emit('change');
  }
};

const closeDialog = (dialogName) => {
  if (isProcessing.value) return;
  if (dialogName === 'dialogHeuris' && formHeurisRef.value) {
    formHeurisRef.value.resetValidation()
    formHeurisRef.value.reset()
  }
  if (dialogName === 'dialogQuestion' && formQuestionRef.value) {
    formQuestionRef.value.resetValidation();
    formQuestionRef.value.reset();
  }
  if (dialogName === 'dialogEdit' && formEditRef.value) {
    formEditRef.value.resetValidation()
    formEditRef.value.reset()
  }

  if (dialogName === 'dialogHeuris') dialogHeuris.value = false;
  else if (dialogName === 'dialogQuestion') dialogQuestion.value = false;
  else if (dialogName === 'dialogEdit') dialogEdit.value = false;
};

const addQuestion = () => {
  if (!newQuestion.value || questionHeuristicIndex.value === null) {
    toast.error(t('HeuristicsTable.errors.invalidHeuristic'))
    return
  }
  if (formQuestionRef.value.validate()) {
    dialogQuestion.value = false
    const newHeuristics = [...heuristics.value]
    newHeuristics[questionHeuristicIndex.value].questions.push({ ...newQuestion.value })
    newHeuristics[questionHeuristicIndex.value].total =
      newHeuristics[questionHeuristicIndex.value].questions.length
    store.dispatch('setHeuristics', newHeuristics)
    newQuestion.value = null
    questionHeuristicIndex.value = null
    formQuestionRef.value.resetValidation()
    emit('change')
  }
}

const validateEdit = () => {
  if (isProcessing.value) {
    console.warn('Validation in progress, aborting');
    return;
  }
  if (!itemEdit.value) {
    console.warn('itemEdit is null, aborting validation');
    dialogEdit.value = false;
    return;
  }
  if (itemSelect.value == null || !heuristics.value[itemSelect.value]) {
    console.warn('Invalid itemSelect or heuristic not found:', itemSelect.value);
    dialogEdit.value = false;
    toast.error(t('HeuristicsTable.errors.invalidHeuristic'));
    return;
  }
  isProcessing.value = true;

  if (formEditRef.value.validate()) {
    const newHeuristics = [...heuristics.value];
    if (itemEdit.value.title === t('HeuristicsTable.titles.editHeuristic')) {
      newHeuristics[itemSelect.value].title = itemEdit.value.titleEdit;
    } else {
      const questionIndex = newHeuristics[itemSelect.value].questions.findIndex(
        (q) => q.id === itemEdit.value.id
      );
      if (questionIndex !== -1) {
        newHeuristics[itemSelect.value].questions[questionIndex].title = itemEdit.value.titleEdit;
      } else {
        console.warn('Question not found for id:', itemEdit.value.id);
        toast.error(t('HeuristicsTable.errors.invalidQuestion'));
      }
    }
    store.dispatch('setHeuristics', newHeuristics);
    emit('change');
    dialogEdit.value = false;
    nextTick(() => {
      dialogEdit.value = false
      isProcessing.value = false
    });
  } else {
    isProcessing.value = false;
  }
};

const updateDescription = () => {
  emit('change');
};
</script>
