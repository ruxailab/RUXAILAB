<template>
  <div class="ma-0 pa-0">
    <v-data-table
      height="420px"
      style="background: #f5f7ff;"
      :headers="headers"
      :items="options"
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
            <p class="subtitleView">Current Options</p>
          </v-col>
          <v-col class="mr-2 mb-1 pb-0 pa-4">
            <v-row justify="end" class="ma-0 pa-0">
              <AddOptionBtn
                :option="option"
                :dialog="dialog"
                :hasValue="hasValue"
                @changeHasValue="hasValue = !hasValue"
                @addOption="updateOptions"
                @dialog="changeDialog"
                @change="emitChange()"
              />
            </v-row>
          </v-col>
        </v-row>
        <v-divider class="mb-4"></v-divider>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import AddOptionBtn from '../atoms/AddOptionBtn'

export default {
  data: () => ({
    headers: [
      {
        text: 'Text',
        align: 'start',
        value: 'text',
      },
      {
        text: 'Description',
        align: 'end',
        value: 'description',
      },
      { text: 'Value', align: 'end', value: 'value' },
      { text: 'Edit/Delete', value: 'actions', align: 'end', sortable: false },
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

      if (this.option.value == null) this.hasValue = false
      else this.hasValue = true
      this.dialog = true
    },
    emitChange() {
      this.$emit('change')
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
  computed: {
    options() {
      return this.$store.state.Tests.Test.testOptions
    },
    testAnswerDocLength() {
      let heuristicAnswers = this.$store.getters.testAnswerDocument
        .heuristicAnswers
      let heuristicAnswersCount = Object.keys(heuristicAnswers).length

      return heuristicAnswersCount
    },
  },
  components: {
    AddOptionBtn,
  },
}
</script>

<style scoped></style>
