<template>
  <div>
    <v-btn
      rounded
      color="#f9a826"
      class="text-white"
      size="small"
      :disabled="testAnswerDocLength > 0"
      :class="{ disabledBtnBackground: testAnswerDocLength > 0 }"
      @click="dialog = true; resetIndex()"
    >
      {{ $t('HeuristicsTable.titles.addNewDescription') }}
    </v-btn>

    <v-dialog
      v-model="dialog"
      width="700"
      persistent
    >
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">
          {{ $t('HeuristicsTable.titles.addNewDescription') }}
        </p>
        <v-divider />
        <v-row
          justify="center"
          class="ma-0"
        >
          <v-col cols="11">
            <v-form
              ref="form"
              @submit.prevent="validate"
            >
              <v-row justify="center">
                <v-col cols="12">
                  <v-text-field
                    v-model="desc.title"
                    :rules="rules"
                    density="compact"
                    variant="outlined"
                    :label="$t('common.title')"
                  />

                  <TextareaForm
                    v-model="desc.text"
                    :title="$t('common.description')"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="small"
            variant="text"
            color="red-lighten-1"
            class="text-white"
            @click="reset"
          >
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn
            v-if="editIndex !== null"
            size="small"
            class="text-white bg-orange"
            @click="submitEdit"
          >
            {{ $t('common.confirm') }}
          </v-btn>
          <v-btn
            v-else
            size="small"
            class="text-white bg-orange"
            @click="validate"
          >
            {{ $t('common.add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import TextareaForm from '@/shared/components/TextareaForm'
import { showInfo } from '@/shared/utils/toast'

const props = defineProps({
  questionIndex: {
    type: Number,
    required: true,
    default: 0,
  },
  heuristicIndex: {
    type: Number,
    required: true,
    default: 0,
  },
})

const emit = defineEmits(['update-description'])

const store = useStore()
const { t } = useI18n()

const dialog = ref(false)
const desc = ref({
  title: '',
  text: '',
})
const editIndex = ref(null)
const form = ref(null)

// Rules for form validation
const rules = ref([(v) => !!v || t('errors.fieldRequired')])

const question = computed(() => {
  return store.state.Tests.Test.testStructure[props.heuristicIndex]
    .questions[props.questionIndex]
})

const testAnswerDocLength = computed(() => {
  const doc = store.getters.testAnswerDocument
  if (!doc || !doc.heuristicAnswers) {
    return 0
  }
  return Object.keys(doc.heuristicAnswers).length
})

const stripHtml = (value) => {
  const el = document.createElement('div')
  el.innerHTML = value || ''
  return (el.textContent || '').trim()
}

const validate = async () => {
  const { valid } = await form.value.validate()
  const strippedText = stripHtml(desc.value.text)
  if (valid && strippedText.length > 0) {
    store.commit('SETUP_HEURISTIC_QUESTION_DESCRIPTION', {
      heuristic: props.heuristicIndex,
      question: props.questionIndex,
      description: desc.value,
      editIndex: editIndex.value,
    })
    emit('update-description')
    reset()
  } else if (valid && strippedText.length === 0) {
    showInfo('alerts.addDescription')
  }
}

const reset = () => {
  dialog.value = false
  form.value.resetValidation()
  desc.value = {
    title: '',
    text: '',
  }
  resetIndex()
}

const resetIndex = () => {
  editIndex.value = null
}

const editSetup = (i) => {
  dialog.value = true
  editIndex.value = i
  desc.value = { ...question.value.descriptions[editIndex.value] }
}

const submitEdit = async () => {
  const { valid } = await form.value.validate()
  const strippedText = stripHtml(desc.value.text)
  if (valid && strippedText.length > 0) {
    store.commit('SETUP_HEURISTIC_QUESTION_DESCRIPTION', {
      heuristic: props.heuristicIndex,
      question: props.questionIndex,
      description: desc.value,
      editIndex: editIndex.value,
    })
    emit('update-description')
    reset()
  } else if (valid && strippedText.length === 0) {
    showInfo('alerts.addDescription')
  }
}

defineExpose({
  editSetup
})
</script>

<style scoped>
.disabledBtn {
  color: rgba(134, 125, 125, 0.438) !important;
}
.disabledBtnBackground {
  background-color: rgba(185, 185, 185, 0.308);
}
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}
.dataCard {
  box-shadow: 0px 4px 4px_RGBA(0, 0, 0, 0.25);
  border-radius: 4px;
}
</style>
