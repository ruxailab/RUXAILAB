<template>
  <div class="mt-0 pa-0 rounded-sm">
    <v-data-table
      height="420px"
      style="background: #f5f7ff;"
      :headers="headers"
      :items="optionsWithFormattedValue"
      :items-per-page="-1"
    >
      <template #[`item.actions`]="{ item }">
        <v-icon
          :disabled="testAnswerDocLength > 0"
          size="small"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          :disabled="testAnswerDocLength > 0"
          size="small"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>

      <template #top>
        <v-row
          class="ma-0"
          align="center"
        >
          <v-card-title class="subtitleView">
            {{ $t('HeuristicsOptionsTable.titles.options') }}
          </v-card-title>
          <v-row
            justify="end"
            class="ma-0 pa-0 mr-4"
          >
            <AddOptionBtn
              :option="option"
              :dialog="dialog"
              :has-value="hasValue"
              @change-has-value="hasValue = !hasValue"
              @add-option="updateOptions"
              @dialog="changeDialog"
              @change="emitChange"
            />
          </v-row>
        </v-row>
        <v-divider class="mb-4" />
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import AddOptionBtn from '../atoms/AddOptionBtn'

const store = useStore()
const { t } = useI18n()

const emit = defineEmits(['change'])

const headers = ref([
  {
    text: t('common.text'),
    align: 'start',
    value: 'text',
  },
  {
    text: t('common.description'),
    align: 'end',
    value: 'description',
  },
  {
    text: t('common.value'),
    align: 'end',
    value: 'value',
  },
  {
    text: t('common.editDelete'),
    value: 'actions',
    align: 'end',
    sortable: false,
  },
])

const option = ref({
  text: '',
  description: '',
  value: null,
})

const dialog = ref(false)
const editIndex = ref(-1)
const hasValue = ref(true)

const options = computed(() => store.state.Tests.Test.testOptions)

const optionsWithFormattedValue = computed(() =>
  options.value.map((opt) => ({
    ...opt,
    value: opt.value === null ? 'No value' : opt.value,
  })),
)

const testAnswerDocLength = computed(() => {
  const testAnswerDocument = store.getters.testAnswerDocument
  if (!testAnswerDocument) return 0
  const heuristicAnswers = testAnswerDocument.heuristicAnswers
  return Object.keys(heuristicAnswers).length
})

watch(dialog, (newVal) => {
  if (!newVal) {
    option.value = {
      text: '',
      value: null,
    }
    hasValue.value = true
  }
})

watch(options, () => {
  emit('change')
})

const changeDialog = (payload) => {
  dialog.value = payload
}

const updateOptions = () => {
  if (editIndex.value === -1) {
    option.value.timestamp = Date.now() // Using timestamp as unique identifier
    options.value.push(option.value)
  } else {
    Object.assign(options.value[editIndex.value], option.value)
    editIndex.value = -1
  }

  option.value = {
    text: '',
    value: null,
  }
  hasValue.value = true
}

const deleteItem = (item) => {
  const index = options.value.findIndex(
    (opt) => opt.timestamp === item.timestamp,
  )
  if (index !== -1) {
    options.value.splice(index, 1)
  }
}

const editItem = (item) => {
  editIndex.value = options.value.findIndex(
    (opt) => opt.timestamp === item.timestamp,
  )
  option.value.text = options.value[editIndex.value].text
  option.value.value = options.value[editIndex.value].value

  hasValue.value = option.value.value !== null
  dialog.value = true
}

const emitChange = () => {
  emit('change')
}
</script>

<style scoped>
.subtitleView {
  font-style: normal;
  font-weight: 500;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
</style>