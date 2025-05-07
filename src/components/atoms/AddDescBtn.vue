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
        <v-row justify="center" class="ma-0">
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

                  <div>{{ $t('common.description') }}:</div>
                  <TextBox
                    ref="textbox"
                    @mounted="setDescriptionText"
                    @update-html="updateText"
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
            color="#f9a826"
            class="text-white"
            @click="submitEdit"
          >
            {{ $t('common.confirm') }}
          </v-btn>
          <v-btn
            v-else
            size="small"
            color="#f9a826"
            class="text-white"
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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import TextBox from '@/components/atoms/TextBox'

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
const toast = useToast()

// Reactive state
const dialog = ref(false)
const desc = ref({
  title: '',
  text: '',
})
const editIndex = ref(null)
const isMounted = ref(false)
const form = ref(null)
const textbox = ref(null)

// Rules for form validation
const rules = ref([(v) => !!v || t('errors.fieldRequired')])

const question = computed(() => {
  return store.state.Tests.Test.testStructure[props.heuristicIndex]
    .questions[props.questionIndex]
})

const testAnswerDocLength = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return 0
  }
  const heuristicAnswers = store.getters.testAnswerDocument.heuristicAnswers
  return Object.keys(heuristicAnswers).length
})
const validate = async () => {
  const { valid } = await form.value.validate()
  if (valid && desc.value.text.length > 0) {
    store.commit('setupHeuristicQuestionDescription', {
      heuristic: props.heuristicIndex,
      question: props.questionIndex,
      description: desc.value,
      editIndex: editIndex.value,
    })
    reset()
  } else if (valid && desc.value.text.length === 0) {
    toast.info(t('alerts.addDescription'))
  }
}

const reset = () => {
  dialog.value = false
  form.value.resetValidation()
  textbox.value?.resetContent?.()
  desc.value = {
    title: '',
    text: '',
  }
  resetIndex()
}

const resetIndex = () => {
  editIndex.value = null
}

const updateText = (html) => {
  desc.value.text = html
}

const editSetup = (i) => {
  dialog.value = true
  editIndex.value = i
  desc.value = { ...question.value.descriptions[editIndex.value] }
  if (isMounted.value) {
    setDescriptionText()
  }
}

const setDescriptionText = () => {
  isMounted.value = true
  textbox.value?.setContent?.(desc.value.text)
}

const submitEdit = async () => {
  const { valid } = await form.value.validate()
  const strippedText = desc.value.text.replace(/<\/?[^>]+(>|$)/g, '').trim()
  if (valid && strippedText.length > 0) {
    emit('update-description', { index: editIndex.value, description: desc.value })
    reset()
  } else if (valid && strippedText.length === 0) {
    toast.info(t('alerts.addDescription'))
  }
}
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
  background: #f5f7ff;
  box-shadow: 0px 4px 4px_RGBA(0, 0, 0, 0.25);
  border-radius: 4px;
}
</style>