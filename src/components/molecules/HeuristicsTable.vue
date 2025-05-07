<template>
  <v-row>
    <!--Dialog Edit-->
    <v-dialog
      v-model="dialogEdit"
      width="800"
      persistent
    >
      <v-card v-if="itemEdit">
        <v-card-title
          class="text-h5 text-white"
          style="background-color: #fca326"
          primary-title
        >
          {{ itemEdit.title }}
        </v-card-title>
        <v-row class="ma-0">
          <v-col cols="10">
            <v-form
              ref="formEditRef"
              @submit.prevent="validateEdit"
            >
              <v-text-field
                v-model="itemEdit.titleEdit"
                density="compact"
                :label="
                  itemEdit.title === $t('HeuristicsTable.titles.editHeuristic')
                    ? $t('HeuristicsTable.placeholders.titleHeuristic')
                    : $t('HeuristicsTable.placeholders.titleQuestion')
                "
                variant="outlined"
                class="mx-3"
                :rules="itemEdit.rule"
                autofocus
              />
            </v-form>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="dialogEdit = false; itemEdit = null"
          >
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>
          <v-btn
            class="text-white"
            color="#fca326"
            @click="validateEdit"
          >
            {{ $t('HeuristicsTable.titles.ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Dialog Create New Question-->
    <v-dialog
      v-model="dialogQuestion"
      width="800"
      persistent
    >
      <v-card v-if="newQuestion">
        <v-card-title
          class="text-h5 text-white"
          primary-title
        >
          {{ $t('HeuristicsTable.titles.newQuestion') }}
        </v-card-title>
        <v-row class="ma-0">
          <v-col cols="10">
            <v-form
              ref="formQuestionRef"
              @submit.prevent="addQuestion"
            >
              <v-text-field
                v-model="newQuestion.title"
                density="compact"
                :label="$t('HeuristicsTable.placeholders.titleNewQuestion')"
                variant="outlined"
                class="mx-2"
                :rules="questionRequired"
                autofocus
              />
            </v-form>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog('dialogQuestion')"
          >
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>
          <v-btn
            class="text-white bg-orange"
            @click="addQuestion"
          >
            {{ $t('HeuristicsTable.titles.add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Card Create New Heuristic-->
    <v-dialog
      v-model="dialogHeuris"
      width="800"
      persistent
    >
      <v-card>
        <v-card-title
          class="text-h5 text-white"
          style="background-color: #fca326"
          primary-title
        >
          {{ $t('HeuristicsTable.titles.creatingHeuristic') }}
        </v-card-title>
        <v-row
          justify="center"
          class="ma-0"
        >
          <v-col cols="10">
            <v-form
              v-if="heuristicForm"
              ref="formHeurisRef"
              @keyup.enter="addHeuris"
            >
              <v-text-field
                v-model="heuristicForm.title"
                density="compact"
                :label="$t('HeuristicsTable.placeholders.titleYourHeuristic')"
                variant="outlined"
                class="mx-2"
                :rules="nameRequired"
                autofocus
              />

              <v-text-field
                v-model="heuristicForm.questions[0].title"
                density="compact"
                :label="$t('HeuristicsTable.placeholders.titleYourQuestion')"
                variant="outlined"
                class="mx-2"
                :rules="questionRequired"
              />
            </v-form>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog('dialogHeuris')"
          >
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>
          <v-btn
            class="text-white bg-orange"
            @click="addHeuris"
          >
            {{ $t('HeuristicsTable.titles.add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialog"
      width="800"
      persistent
    />

    <!-- Main -->
    <v-col cols="12">
      <v-card
        style="background: #f5f7ff"
        elevation="0"
      >
        <v-card-title class="subtitleView">
          {{ $t('HeuristicsTable.titles.currentHeuristics') }}
        </v-card-title>
        <v-divider />
        <v-row
          v-if="heuristics.length"
          class="ma-0 pa-0"
        >
          <!--Heuristics List-->
          <v-col
            class="ma-0 pa-0"
            cols="12"
            sm="6"
            md="4"
          >
            <v-list
              height="560px"
              class="pt-0 ma-0 pa-0"
              density="compact"
            >
              <v-list-item
                :disabled="testAnswerDocLength > 0"
                :class="{ disabledBtnBackground: testAnswerDocLength > 0 }"
                @click="dialogHeuris = true"
              >
                <template #prepend>
                  <v-icon style="color:#fca326">
                    mdi-plus
                  </v-icon>
                </template>
                
                <v-list-item-title
                  style="color:#fca326"
                  :class="{ disabledBtn: testAnswerDocLength > 0 }"
                >
                  <strong>{{
                    $t('HeuristicsTable.titles.addNewHeuristic')
                  }}</strong>
                </v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-subheader>
                <v-text-field
                  v-model="search"
                  variant="solo"
                  flat
                  prepend-icon="mdi-magnify"
                  color="orange"
                  class="ml-1"
                  width="360"
                  single-line
                  hide-details="auto"
                  density="compact"
                >
                  <template #label>
                    <span                      
                      style="font-size: 12px"
                    >
                      {{ $t('HeuristicsTable.titles.searchHeuristics') }}</span>
                  </template>
                </v-text-field>
              </v-list-subheader>
              <v-divider />
              <!--Heuristics total list-->
              <v-list
                v-model="itemSelect"
                height="470px"
                color="#fca326"
                class="list-scroll"
              >
                <template v-if="filteredHeuristics.length === 0">
                  <center
                    class="mt-16"
                    style="color: #a7a7a7"
                  >
                    <strong>{{ $t('HeuristicsTable.titles.noHeuristicsFound') }}</strong><br>
                    <h5>{{ $t('HeuristicsTable.messages.youMustHave') }}</h5>
                    <br>
                    <v-icon>mdi-file-remove</v-icon>
                  </center>
                </template>
                <template v-else>
                  <v-list-item
                    v-for="(item, i) in filteredHeuristics"
                    :key="i"
                    class="ma-0 py-0"
                    small
                    @click="itemSelect = i"
                    @mouseenter="hoveredItem = i"
                    @mouseleave="hoveredItem = null"
                  >
                    <v-row justify="space-between" align="center" class="ma-0 py-0">
                      <v-col cols="11" class="ma-0 pa-0">
                        <v-list-item-title
                          style="
                            margin-top: 8px !important;
                            margin-bottom: 8px !important;
                            padding-top: 8px !important;
                            padding-bottom: 8px !important;
                          "
                        >
                          {{ item.id + 1 }} - {{ item.title }}
                        </v-list-item-title>
                      </v-col>
                      <v-col cols="1" class="ma-0 pa-0">
                        <v-list-item-action
                          v-if="hoveredItem === i && i != itemSelect"
                          style="
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            margin: 0;
                            padding: 0;
                          "
                        >
                          <v-icon
                            size="small"
                            color="orange"
                            icon="mdi-arrow-up"
                            :disabled="item.id == 0 || testAnswerDocLength > 0"
                            @click.stop="moveItemUp(i)"
                          />
                          <v-icon
                            size="small"
                            color="orange"
                            icon="mdi-arrow-down"
                            :disabled="testAnswerDocLength > 0 || i === filteredHeuristics.length - 1"
                            @click.stop="moveItemDown(i)"
                          />
                        </v-list-item-action>
                      </v-col>
                    </v-row>
                    <!-- <template v-if="i === itemSelect" #prepend>
                      <v-icon
                        icon="mdi-chevron-right"
                        size="20"
                        color="#fca326"
                        style="margin-right: 8px;"
                      />
                    </template> -->
                  </v-list-item>
                </template>
              </v-list>
            </v-list>
          </v-col>

          <v-divider vertical />

          <!--Questions List-->
          <v-col
            v-if="itemSelect != null"
            class="ma-0 pa-0"
            cols="12"
            sm="6"
            md="4"
          >
            <v-list
              density="compact"
              height="560px"
              class="ma-0 pa-0"
            >
              <v-list-subheader class="ma-0">
                <v-list-item width="380" height="auto" class="ma-0 pa-0">
                  <v-row justify="space-between" align="center" class="ma-0">
                    <v-col cols="8" class="pa-0">
                      <text-clamp
                        :text="heuristics[itemSelect].title + ' - ' + $t('HeuristicsTable.titles.questions')"
                        :max-lines="2"
                      />
                    </v-col>
                    <template #top>
                      <v-row>
                        <v-col class="ml-2 mb-1 pa-4 pb-0">
                          <p class="subtitleView">
                            {{ $t('HeuristicsTable.titles.descriptions') }}
                          </p>
                        </v-col>
                        <v-col class="mr-2 mb-1 pb-0 pa-4">
                          <v-row
                            justify="end"
                            class="ma-0 pa-0"
                          >
                            <AddDescBtn
                              ref="descBtn"
                              :question-index="questionSelect"
                              :heuristic-index="itemSelect"
                            />
                          </v-row>
                        </v-col>
                      </v-row>
                    </template>
                    <v-spacer />
                    <v-col cols="4" class="pa-0 text-right">
                      <v-menu
                        v-model="menuHeuristics"
                        :offset="[8, 0]"
                      >
                        <template #activator="{ props }">
                          <v-icon
                            icon="mdi-dots-vertical"
                            v-bind="props"
                            @click="handleNotEditable"
                          >
                          </v-icon>
                        </template>
                        <v-list
                          density="compact"
                          :class="{ disabledBtnBackground: testAnswerDocLength > 0 }"
                        >
                          <!--Edit Heuris Flag -->
                          <v-list-item
                            :disabled="testAnswerDocLength > 0 ? false : false"
                            @click="editHeuris(heuristics[itemSelect])"
                          >
                            <template #prepend>
                              <v-icon>mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>
                              {{ $t('HeuristicsTable.titles.editHeuristic') }}
                            </v-list-item-title>
                          </v-list-item>
                          <v-list-item
                            :disabled="testAnswerDocLength > 0 ? true : false"
                            @click="deleteHeuristic(itemSelect)"
                          >
                            <template #prepend>
                              <v-icon>mdi-delete</v-icon>
                            </template>
                            <v-list-item-title>
                              {{ $t('HeuristicsTable.titles.deleteHeuristic') }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-list-subheader>
              <v-divider />
              <v-list-item
                :disabled="testAnswerDocLength > 0 ? true : false"
                :class="{ disabledBtnBackground: testAnswerDocLength > 0 }"
                @click="setupQuestion"
              >
                <template #prepend>
                  <v-icon
                    color="#fca326"
                    :class="{ disabledBtn: testAnswerDocLength > 0 }"
                  >
                    mdi-plus
                  </v-icon>
                </template>
                
                <v-list-item-title
                  style="color: #fca326"
                  :class="{ disabledBtn: testAnswerDocLength > 0 }"
                >
                  {{ $t('HeuristicsTable.titles.addNewQuestion') }}
                </v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list
                v-model="questionSelect"
                density="compact"
                height="470px"
                color="#fca326"
                class="list-scroll"
              >
                <v-list-item
                  v-for="(item, i) in heuristics[itemSelect].questions"
                  :key="i"
                  @click="questionSelect = i"
                >
                  <v-list-item-title class="py-3">
                    {{ item.title }}
                  </v-list-item-title>
                  <template
                    v-if="i == questionSelect"
                    #prepend
                  >
                    <v-icon class="pt-4">
                      mdi-chevron-right
                    </v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-list>
          </v-col>
          <v-divider vertical />
          <!--Questions content-->
          <v-col
            v-if="questionSelect != null"
            class="ma-0 pa-0 questionsContent"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              height="560px"
              elevation="0"
              class="pa-0 ma-0"
            >
              <v-list-subheader
                class="px-2 pt-0 ma-0"
                style="font-size: 12px; height: 40px; display: flex; align-items: center;"
              >
                <v-list-item width="500" height="auto" class="ma-0 pa-0">
                  <v-row justify="space-between" class="ma-0">
                    <v-col cols="11" class="pa-0">
                      <div
                        class="custom-scrollbar"
                        style="flex: 1; overflow-y: auto; max-height: 40px; padding-right: 8px;"
                      >
                        {{ heuristics[itemSelect].questions[questionSelect].title }}
                      </div>
                    </v-col>
                    <v-col cols="1" class="pa-0">
                      <v-menu
                        v-model="menuQuestions"
                        :offset="[8, 0]"
                      >
                        <template #activator="{ props }">
                          <v-icon
                            icon="mdi-dots-vertical"
                            size="20"
                            v-bind="props"
                            @click="handleNotEditable"
                          >
                          </v-icon>
                        </template>
                        <v-list
                          density="compact"
                          :disabled="testAnswerDocLength > 0 ? false : false"
                          :class="{ disabledBtnBackground: testAnswerDocLength > 0 }"
                        >
                          <v-list-item
                            :disabled="testAnswerDocLength > 0 ? false : false"
                            @click="editQuestions(heuristics[itemSelect].questions[questionSelect])"
                          >
                            <template #prepend>
                              <v-icon>mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>
                              {{ $t('HeuristicsTable.titles.editQuestion') }}
                            </v-list-item-title>
                          </v-list-item>
                          <v-list-item
                            :disabled="testAnswerDocLength > 0 ? true : false"
                            @click="deleteQuestion(questionSelect)"
                          >
                            <template #prepend>
                              <v-icon>mdi-delete</v-icon>
                            </template>
                            <v-list-item-title>
                              {{ $t('HeuristicsTable.titles.deleteQuestion') }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-list-subheader>
              <v-divider />

              <v-row>
                <v-col>
                  <v-data-table
                    height="350px"
                    :headers="headers"
                    :items="heuristics[itemSelect].questions[questionSelect].descriptions"
                    :items-per-page="5"
                  >
                    <template #top>
                      <v-row
                        class="mx-2 my-0 pa-0"
                        style="height: 40px"
                      >
                        <v-col class="ma-0 pa-0 py-1">
                          <p>
                            {{ $t('HeuristicsTable.titles.descriptions') }}
                          </p>
                        </v-col>
                        <v-col class="ma-0 pa-0">
                          <v-row
                            justify="end"
                            class="ma-0 pa-0 pt-1"
                          >
                            <AddDescBtn
                              ref="descBtn"
                              :question-index="questionSelect"
                              :heuristic-index="itemSelect"
                              @update-description="updateDescription"
                            />
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-divider class="mb-4" />
                    </template>

                    <template #item.actions="{ item }">
                      <!-- table actions -->
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
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row
          v-else
          justify="center"
        >
          <v-col
            class="ma-10"
            cols="10"
          >
            <v-row
              justify="center"
              align="center"
              class="ma-0"
            >
              <p class="subtitleView">
                {{ $t('HeuristicsTable.messages.noHeuristics') }}
              </p>
            </v-row>
            <v-row
              class="ma-4"
              justify="center"
              align="center"
            >
              <v-icon
                icon="mdi-plus-circle-outline"
                size="100"
                color="grey"
                @click="dialogHeuris = true"
              >
              </v-icon>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
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

const menuHeuristics = ref(false)
const menuQuestions = ref(false)
const itemSelect = ref(null)
const questionSelect = ref(null)
const itemEdit = ref(null)
const newQuestion = ref(null)
const comparisonSelect = ref(null)
const heuristicForm = ref(null)
const search = ref('')
const searchBar = ref(false)
const dialog = ref(false)
const dialogEdit = ref(false)
const dialogHeuris = ref(false)
const dialogQuestion = ref(false)
const editIndex = ref(-1)
const hoveredItem = ref(null)
const formEditRef = ref(null)
const formQuestionRef = ref(null)
const formHeurisRef = ref(null)
const descBtn = ref(null)

const headers = ref([
  {
    title: 'Title',
    align: 'start',
    value: 'title',
  },
  { title: 'Actions', value: 'actions', align: 'end', sortable: false },
])

const nameRequired = ref([
  (v) => !!v || t('HeuristicsTable.validation.nameRequired'),
])
const questionRequired = ref([
  (v) => !!v || t('HeuristicsTable.validation.questionRequired'),
])

const csvHeuristics = computed(() => store.state.Tests.Test.testStructure)

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

const heuristics = computed(() =>
  store.state.Tests.Test.testStructure ? store.state.Tests.Test.testStructure : []
)

const arrayQuestions = computed(() => {
  const aux = []
  if (itemSelect.value !== null) {
    const array = Array.from(heuristics.value[itemSelect.value].questions)
    array.forEach((el) => {
      aux.push(Object.assign({}, { id: el.id, res: '', com: '' }))
    })
  }
  return aux
})

const totalQuestions = computed(() => {
  return heuristics.value.reduce((sum, h) => sum + h.total, 0)
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
  }
}

const deleteHeuristic = (item) => {
  const config = confirm(
    `${t('alerts.deleteHeuristic')} ${heuristics.value[item].title}?`
  )

  if (config) {
    store.commit('removeHeuristic', item)
    itemSelect.value = null
    questionSelect.value = null
  }
  menuQuestions.value = false
  menuHeuristics.value = false
}

const deleteQuestion = (item) => {
  if (heuristics.value[itemSelect.value].questions.length > 1) {
    const config = confirm(
      `Are you sure delete the Question ${
        heuristics.value[itemSelect.value].questions[item].title
      }?`
    )

    if (config) {
      heuristics.value[itemSelect.value].questions.splice(item, 1)
      questionSelect.value = null
      heuristics.value[itemSelect.value].total =
        heuristics.value[itemSelect.value].questions.length
    }
  } else {
    toast.warning("Sorry, but you can't delete all heuristics questions")
  }

  menuQuestions.value = false
  menuHeuristics.value = false
}

const editHeuris = (item) => {
  itemEdit.value = {
    title: 'Edit Heuristic',
    titleEdit: item.title,
    rule: nameRequired.value,
    id: item.id,
  }
  dialogEdit.value = true
}

const editQuestions = (item) => {
  itemEdit.value = {
    title: 'Edit Question',
    titleEdit: item.title,
    rule: questionRequired.value,
  }
  dialogEdit.value = true
}

const editDescription = (desc) => {
  const ind = heuristics.value[itemSelect.value].questions[
    questionSelect.value
  ].descriptions.indexOf(desc)
  descBtn.value.editSetup(ind)
}

const setupQuestion = () => {
  newQuestion.value = {
    id:
      heuristics.value[itemSelect.value].questions[
        heuristics.value[itemSelect.value].questions.length - 1
      ].id + 1,
    title: '',
    descriptions: [],
  }
  dialogQuestion.value = true
}

const deleteItem = (item) => {
  heuristics.value[itemSelect.value].questions[
    questionSelect.value
  ].descriptions.splice(
    heuristics.value[itemSelect.value].questions[questionSelect.value].descriptions.indexOf(
      item
    ),
    1
  )
}

const addHeuris = () => {
  if (formHeurisRef.value.validate()) {
    dialogHeuris.value = false
    heuristics.value.push({ ...heuristicForm.value })
    itemSelect.value = heuristics.value.length - 1
    heuristics.value.total = totalQuestions.value
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
  else if (dialogName === 'dialog') dialog.value = false
}

const addQuestion = () => {
  if (formQuestionRef.value.validate()) {
    dialogQuestion.value = false
    heuristics.value[itemSelect.value].questions.push(newQuestion.value)
    newQuestion.value = null
    heuristics.value[itemSelect.value].total =
      heuristics.value[itemSelect.value].questions.length
    formQuestionRef.value.resetValidation()
    emit('change')
  }
}

const validateEdit = () => {
  if (formEditRef.value.validate()) {
    dialogEdit.value = false
    if (itemEdit.value.title === 'Edit Heuristic') {
      heuristics.value[itemSelect.value].title = itemEdit.value.titleEdit
    } else {
      heuristics.value[itemSelect.value].questions[questionSelect.value].title =
        itemEdit.value.titleEdit
    }
    itemEdit.value = null
  }
}

const handleNotEditable = () => {
  console.log('not editable')
  // if (testAnswerDocLength.value > 0) {
  //   toast.error(t('errors.globalError'))
  // }
}

const updateDescription = () => {
  // Assuming this is handled by AddDescBtn component
}
</script>

<style scoped>
.disabledBtn {
  color: rgba(75, 65, 65, 0.438) !important;
}
.disabledBtnBackground {
  background-color: #f0f0f0;
}
.search-bar {
  color: #dbdde4;
}
.subtitleView {
  font-style: normal;
  font-weight: 500;
  font-size: 18.18px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.list-scroll {
  overflow: auto;
}
.list-scroll::-webkit-scrollbar {
  width: 5px;
}
.list-scroll::-webkit-scrollbar-track {
  background: none;
}
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
.csv-btn {
  position: absolute;
  right: 10px;
  z-index: 0;
  width: 10vw;
  height: 4vh;
  border-radius: 0px 0px 20px 20px;
  box-shadow: 0px 2px 5px black;
  background-color: #fca326;
  transition: 0.5s;
}

.csv-btn:hover {
  height: 10vh;
  content: 'test';
}

.csv-model {
  position: absolute;
  top: 40%;
  right: 32%;
  z-index: 50;
  width: 40%;
  height: 42%;
  background-color: #dbdde4;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}
.import-img {
  width: 10vw;
  height: 10vw;
}

.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .questionsList {
    margin-top: 0px;
  }
  .questionsContent {
    margin-top: 0px;
  }
}

.custom-scrollbar {
  overflow: auto;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: none;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}
</style>