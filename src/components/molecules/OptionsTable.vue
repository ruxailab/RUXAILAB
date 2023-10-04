<template>
  <div class="ma-0 pa-0">
    <v-data-table
      height="420px"
      style="background: #f5f7ff;"
      :headers="headers"
      :items="optionsWithFormattedValue"
      :items-per-page="-1"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon
          :disabled="testAnswerDocLength > 0 ? true : false"
          small
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          :disabled="testAnswerDocLength > 0 ? true : false"
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>

      <template v-slot:top>
        <v-row class>
          <v-col class="ml-2 mb-1 pa-4 pb-0">
            <p class="subtitleView">
              Current Options
            </p>
          </v-col>
          <v-col class="mr-2 mb-1 pb-0 pa-4">
            <v-row justify="end" class="ma-0 pa-0">
              <AddOptionBtn
                :option="option"
                :dialog="dialog"
                :has-value="hasValue"
                @changeHasValue="hasValue = !hasValue"
                @addOption="updateOptions"
                @dialog="changeDialog"
                @change="emitChange()"
              />
            </v-row>
          </v-col>
        </v-row>
        <v-divider class="mb-4" />
      </template>
    </v-data-table>
  </div>
</template>

<script>
import i18n from '@/i18n'
import AddOptionBtn from '../atoms/AddOptionBtn'

export default {
  components: {
    AddOptionBtn,
  },
  data: () => ({
    headers: [
      {
        text: i18n.t('common.text'),
        align: 'start',
        value: 'text',
      },
      {
        text: i18n.t('common.description'),
        align: 'end',
        value: 'description',
      },
      { text: i18n.t('common.value'), align: 'end', value: 'value' },
      { text: i18n.t('common.editDelete'), value: 'actions', align: 'end', sortable: false },
    ],
    option: {
      text: '',
      description: '',
      value: null,
    },
    dialog: false,
    editIndex: -1,
    hasValue: true,
  }),
  computed: {
    options() {
      return this.$store.state.Tests.Test.testOptions
    },
    optionsWithFormattedValue() {
      return this.options.map((option) => {
        if (option.value === null) {
          return { ...option, value: 'No value' }
        } else {
          return option
        }
      })
    },
    testAnswerDocLength() {
      const heuristicAnswers = this.$store.getters.testAnswerDocument
        .heuristicAnswers
      const heuristicAnswersCount = Object.keys(heuristicAnswers).length

      return heuristicAnswersCount
    },
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.option = {
          text: '',
          value: null,
        }
        this.hasValue = true
      }
    },
    options() {
      this.$emit('change')
    },
  },
  methods: {
    updateOptions() {
      if (this.editIndex == -1) {
        this.options.push(this.option)
      } else {
        Object.assign(this.options[this.editIndex], this.option)
        this.editIndex = -1
      }

      this.option = {
        text: '',
        value: null,
      }
      this.hasValue = true
    },
    changeDialog(payload) {
      this.dialog = payload
    },
    deleteItem(item) {
      this.options.splice(this.options.indexOf(item), 1)
    },
    editItem(item) {
      this.editIndex = this.options.indexOf(item)
      this.option.text = this.options[this.editIndex].text
      this.option.value = this.options[this.editIndex].value

      if (this.option.value === null) this.hasValue = false
      else this.hasValue = true
      this.dialog = true
    },
    emitChange() {
      this.$emit('change')
    },
  },
}
</script>

<style scoped></style>
