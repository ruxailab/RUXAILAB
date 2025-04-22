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
              ref="formEdit"
              @submit.prevent="validateEdit()"
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
            @click=";(dialogEdit = false), (itemEdit = null)"
          >
            {{ $t('HeuristicsTable.titles.cancel') }}
          </v-btn>
          <v-btn
            class="text-white"
            color="#fca326"
            @click="validateEdit()"
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
              ref="formQuestion"
              @submit.prevent="addQuestion()"
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
            class="text-white"
            color="#fca326"
            @click="addQuestion()"
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
              ref="formHeuris"
              @keyup.enter="addHeuris()"
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
            class="text-white"
            color="#fca326"
            @click="addHeuris()"
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
                :disabled="testAnswerDocLength > 0 ? true : false"
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
                  class="ml-2"
                  single-line
                  hide-details
                  density="compact"
                >
                  <template #label>
                    <span
                      class="ml-2"
                      style="font-size: 12px"
                    >
                      {{ $t('HeuristicsTable.titles.searchHeuristics') }}</span>
                  </template>
                </v-text-field>
              </v-list-subheader>
              <v-divider />
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
                    <strong>{{
                      $t('HeuristicsTable.titles.noHeuristicsFound')
                    }}</strong><br>
                    <h5>{{ $t('HeuristicsTable.messages.youMustHave') }}</h5>
                    <br>
                    <v-icon>mdi-file-remove</v-icon>
                  </center>
                </template>
                <template v-else>
                  <v-list-item
                    v-for="(item, i) in filteredHeuristics"
                    :key="i"
                    class="pb-0 pt-0"
                    small
                    @mouseenter="hoveredItem = i"
                    @mouseleave="hoveredItem = null"
                  >
                    <v-list-item-title
                      style="
                        margin-top: 10px !important;
                        margin-bottom: 10px !important;
                        padding-top: 10px !important;
                        padding-bottom: 10px !important;
                        justify-content: space-between;
                      "
                    >
                      {{ item.id + 1 }} - {{ item.title }}
                    </v-list-item-title>
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: center !important;
                      "
                    >
                      <v-list-item-action
                        v-if="hoveredItem === i && i != itemSelect"
                        style="
                          margin: 0px !important;
                          padding: 0px !important;
                        "
                      >
                        <v-btn
                          icon
                          size="small"
                          style="
                            margin: 0px !important;
                            padding: 0px !important;
                          "
                          :disabled="
                            item.id == 0 || testAnswerDocLength > 0
                              ? true
                              : false
                          "
                          @click.stop="moveItemUp(i)"
                        >
                          <v-icon
                            size="x-small"
                            color="orange"
                            style="
                              margin: 0px !important;
                              padding: 0px !important;
                            "
                          >
                            mdi-arrow-up
                          </v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          size="small"
                          style="
                            margin: 0px !important;
                            padding: 0px !important;
                          "
                          :disabled="
                            testAnswerDocLength > 0
                              ? true
                              : false || i === filteredHeuristics.length - 1
                          "
                          @click.stop="moveItemDown(i)"
                        >
                          <v-icon
                            size="x-small"
                            color="orange"
                            style="
                              margin: 0px !important;
                              padding: 0px !important;
                            "
                          >
                            mdi-arrow-down
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </div>
                    <template
                      v-if="i == itemSelect"
                      #prepend
                    >
                      <v-icon class="pt-4">
                        mdi-chevron-right
                      </v-icon>
                    </template>
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
              <v-list-subheader>
                <text-clamp
                  :text="heuristics[itemSelect].title + ' - ' + $t('HeuristicsTable.titles.questions')"
                  :max-lines="2"
                  autoresize
                />
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
                <v-menu
                  v-model="menuHeuristics"
                  :offset="{ x: 8 }"
                >
                  <template #activator="{ props }">
                    <v-btn
                      icon
                      v-bind="props"
                      @click="HandleNotEditable"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
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
              </v-list-subheader>
              <v-divider />
              <v-list-item
                :disabled="testAnswerDocLength > 0 ? true : false"
                :class="{ disabledBtnBackground: testAnswerDocLength > 0 }"
                @click="setupQuestion()"
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
                <div
                  class="custom-scrollbar"
                  style="flex: 1; overflow-y: auto; max-height: 40px; padding-right: 8px;"
                >
                  {{ heuristics[itemSelect].questions[questionSelect].title }}
                </div>
                <v-menu
                  v-model="menuQuestions"
                  :offset="{ x: 8 }"
                >
                  <template #activator="{ props }">
                    <v-btn
                      icon
                      v-bind="props"
                      @click="HandleNotEditable"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
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
              <v-btn
                icon
                size="x-large"
                color="grey"
                @click="dialogHeuris = true"
              >
                <v-icon size="100">
                  mdi-plus-circle-outline
                </v-icon>
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import AddDescBtn from '@/components/atoms/AddDescBtn'
import TextClamp from 'vue3-text-clamp'
import i18n from '@/i18n'

export default {
  components: {
    AddDescBtn,
    TextClamp,
  },
  emits: ['change'],
  data: () => ({
    menuHeuristics: false,
    menuQuestions: false,
    itemSelect: null,
    questionSelect: null,
    itemEdit: null,
    newQuestion: null,
    comparisonSelect: null,
    heuristicForm: null,
    search: '',
    searchBar: false,
    headers: [
      {
        text: 'Title',
        align: 'start',
        value: 'title',
      },
      { text: 'Actions', value: 'actions', align: 'end', sortable: false },
    ],
    dialog: false,
    dialogEdit: false,
    dialogHeuris: false,
    dialogQuestion: false,
    editIndex: -1,
    nameRequired: [
      (v) => !!v || i18n.t('HeuristicsTable.validation.nameRequired'),
    ],
    questionRequired: [
      (v) => !!v || i18n.t('HeuristicsTable.validation.questionRequired'),
    ],
    hoveredItem: null,
  }),
  computed: {
    csvHeuristics() {
      return this.$store.state.Tests.Test.testStructure
    },
    filteredHeuristics() {
      if (this.search === '') {
        return this.heuristics.filter((item) => {
          const searchLower = this.search.toLowerCase()
          const idString = item.id.toString()

          return (
            item.title.toLowerCase().includes(searchLower) ||
            idString.includes(searchLower) ||
            idString === searchLower
          )
        })
      } else {
        return this.heuristics.filter((item) => {
          const searchLower = this.search.toLowerCase()
          const idString = item.id.toString()

          return (
            item.title.toLowerCase().includes(searchLower) ||
            idString.includes(searchLower) ||
            idString === searchLower
          )
        })
      }
    },
    heuristics() {
      return this.$store.state.Tests.Test.testStructure
        ? this.$store.state.Tests.Test.testStructure
        : []
    },
    arrayQuestions() {
      const aux = []
      const array = Array.from(this.heuristics[this.itemSelect].questions)
      array.forEach((el) => {
        aux.push(Object.assign({}, { id: el.id, res: '', com: '' }))
      })
      return []
    },
    totalQuestions() {
      let result = 0
      this.heuristics.forEach((h) => {
        result += h.total
      })
      return result
    },
    testAnswerDocLength() {
      if (!this.$store.getters.testAnswerDocument) {
        return 0
      }
      const heuristicAnswers = this.$store.getters.testAnswerDocument
        .heuristicAnswers
      const heuristicAnswersCount = Object.keys(heuristicAnswers).length

      return heuristicAnswersCount
    },
  },
  watch: {
    dialogHeuris() {
      if (!this.dialogHeuris && this.heuristics.length > 0 && !this.itemEdit) {
        this.heuristicForm = {
          id: this.heuristics[this.heuristics.length - 1].id + 1,
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
        this.heuristicForm.total = this.heuristicForm.questions.length
      }
      if (this.dialogHeuris) {
        //when dialog opens everything is reset
        if (this.$refs.formHeuris) {
          this.$refs.formHeuris.resetValidation()
          this.$refs.formHeuris.reset()
        }
      }
    },
    itemSelect() {
      if (this.itemSelect !== null) this.questionSelect = null
      else this.itemSelect = null
    },
    loader() {
      const l = this.loader
      this[l] = !this[l]

      if (this.csvFile !== null) {
        setTimeout(() => (this[l] = false), 3000)
        setTimeout(() => (this.csvFile = null), 3000)
        this.loader = null
      } else {
        setTimeout(() => (this[l] = false), 3000)
        this.$toast.warning(
          'No csv file selected. \nPlease select one before procede.',
        )
        this.loader = null
      }
    },
  },
  async created() {
    if (this.heuristics.length) {
      this.heuristicForm = {
        id: this.heuristics[this.heuristics.length - 1].id + 1,
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
      this.heuristicForm = {
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
    this.heuristicForm.total = this.heuristicForm.questions.length
  },
  methods: {
    moveItemUp(index) {
      if (index > 0) {
        const itemToMove = this.filteredHeuristics[index]
        const itemAbove = this.filteredHeuristics[index - 1]

        this.filteredHeuristics[index] = itemAbove
        this.filteredHeuristics[index - 1] = itemToMove

        itemToMove.id = index - 1
        itemAbove.id = index

        this.heuristics[index] = itemAbove
        this.heuristics[index - 1] = itemToMove

        itemToMove.id = index - 1
        itemAbove.id = index

        this.$toast.warning(i18n.t('HeuristicsTable.messages.changeWeights'))
      }
    },
    moveItemDown(index) {
      if (index < this.filteredHeuristics.length - 1) {
        const itemToMove = this.filteredHeuristics[index]
        const itemBelow = this.filteredHeuristics[index + 1]

        this.filteredHeuristics[index] = itemBelow
        this.filteredHeuristics[index + 1] = itemToMove

        itemToMove.id = index + 1
        itemBelow.id = index

        this.heuristics[index] = itemBelow
        this.heuristics[index + 1] = itemToMove

        itemToMove.id = index + 1
        itemBelow.id = index

        this.$toast.warning(i18n.t('HeuristicsTable.messages.changeWeights'))
      }
    },
    deleteHeuristic(item) {
      const config = confirm(
        `${i18n.t('alerts.deleteHeuristic')} ${this.heuristics[item].title}?`,
      )

      if (config) {
        this.$store.commit('removeHeuristic', item)
        this.itemSelect = null
        this.questionSelect = null
      }
      this.menuQuestions = false
      this.menuHeuristics = false
    },
    deleteQuestion(item) {
      if (this.heuristics[this.itemSelect].questions.length > 1) {
        const config = confirm(
          `Are you sure delete the Question ${
            this.heuristics[this.itemSelect].questions[item].title
          }?`,
        )

        if (config) {
          this.heuristics[this.itemSelect].questions.splice(item, 1)
          this.questionSelect = null

          this.heuristics[this.itemSelect].total = this.heuristics[
            this.itemSelect
          ].questions.length
        }
      } else {
        this.$toast.warning(
          'Sorry, but you can\'t delete all heuristics questions',
        )
      }

      this.menuQuestions = false
      this.menuHeuristics = false
    },
    editHeuris(item) {
      this.itemEdit = {
        title: 'Edit Heuristic',
        titleEdit: item.title,
        rule: this.nameRequired,
        id: item.id,
      }
      this.dialogEdit = true
    },
    editQuestions(item) {
      this.itemEdit = {
        title: 'Edit Question',
        titleEdit: item.title,
        rule: this.questionRequired,
      }
      this.dialogEdit = true
    },
    editDescription(desc) {
      const ind = this.heuristics[this.itemSelect].questions[
        this.questionSelect
      ].descriptions.indexOf(desc)
      this.$refs.descBtn.editSetup(ind)
    },
    setupQuestion() {
      this.newQuestion = {
        id:
          this.heuristics[this.itemSelect].questions[
            this.heuristics[this.itemSelect].questions.length - 1
          ].id + 1,
        title: '',
        descriptions: [],
      }
      this.dialogQuestion = true
    },
    deleteItem(item) {
      this.heuristics[this.itemSelect].questions[
        this.questionSelect
      ].descriptions.splice(
        this.heuristics[this.itemSelect].questions[
          this.questionSelect
        ].descriptions.indexOf(item),
        1,
      )
    },
    addHeuris() {
      if (this.$refs.formHeuris.validate()) {
        this.dialogHeuris = false

        this.heuristics.push(Object.assign({}, this.heuristicForm))
        this.itemSelect = this.heuristics.length - 1

        this.heuristics.total = this.totalQuestions

        this.$refs.formHeuris.resetValidation()

        this.$emit('change')
      }
    },
    closeDialog(dialogName) {
      this[dialogName] = false

      if (this.$refs.formHeuris) {
        this.$refs.formHeuris.resetValidation()
        this.$refs.formHeuris.reset()
      }
      if (this.$refs.formQuestion) {
        this.$refs.formQuestion.resetValidation()
        this.$refs.formQuestion.reset()
        this.newQuestion = null
      }
    },
    addQuestion() {
      if (this.$refs.formQuestion.validate()) {
        this.dialogQuestion = false

        this.heuristics[this.itemSelect].questions.push(this.newQuestion)
        this.newQuestion = null

        this.heuristics[this.itemSelect].total = this.heuristics[
          this.itemSelect
        ].questions.length

        this.$refs.formQuestion.resetValidation()
        this.$emit('change')
      }
    },
    validateEdit() {
      if (this.$refs.formEdit.validate()) {
        this.dialogEdit = false

        if (this.itemEdit.title === 'Edit Heuristic') {
          this.heuristics[this.itemSelect].title = this.itemEdit.titleEdit
        } else {
          this.heuristics[this.itemSelect].questions[
            this.questionSelect
          ].title = this.itemEdit.titleEdit
        }
      }
    },
    HandleNotEditable() {
      console.log('not editable')
      // if (this.testAnswerDocLength > 0) {
      //   this.$toast.error(i18n.t(errors.globalError))
      // }
    },
  },
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