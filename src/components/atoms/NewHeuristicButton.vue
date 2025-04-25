<template>
  <div>
    <v-btn
      rounded
      color="#f9a826"
      class="text-white"
      size="small"
      disabled
      @click="$emit('openDialog')"
    >
      {{ $t('HeuristicsTable.titles.addNewHeuristic') }}
    </v-btn>

    <v-dialog
      :model-value="localDialog"
      width="500"
      persistent
      @update:model-value="updateDialog"
    >
      <v-card class="dataCard">
        <p class="subtitleView ma-3 pt-3 mb-0 pa-2">
          {{ $t('HeuristicsTable.titles.addNewHeuristic') }}
        </p>
        <v-divider />
        <v-row
          justify="center"
          class="ma-0"
        >
          <v-col cols="11">
            <v-form ref="form">
              <v-text-field
                v-model="localHeuris.title"
                label="Title"
                class="mx-3"
                :rules="nameRequired"
              />
              <v-row
                v-for="(n, i) in localHeuris.questions"
                :key="i"
                align="center"
                justify="space-around"
                class="mx-1"
              >
                <v-col
                  cols="10"
                  class="pt-0 pb-0"
                >
                  <v-text-field
                    v-model="localHeuris.questions[i].text"
                    :label="'Question ' + (i + 1)"
                    :rules="questionRequired"
                  />
                </v-col>

                <v-col cols="1">
                  <v-btn
                    size="small"
                    icon
                  >
                    <v-icon
                      size="small"
                      @click="removeQuestion(i)"
                    >
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <v-btn
                color="#f9a826"
                variant="text"
                class="ma-3"
                @click="addQuestion()"
              >
                {{ $t('HeuristicsTable.titles.addNewQuestion') }}
              </v-btn>
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
            @click="closeDialog"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            size="small"
            color="#f9a826"
            class="text-white"
            @click="validate"
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { cloneDeep } from 'lodash'

const props = defineProps({
  heuris: {
    type: Object,
    required: true,
  },
  dialog: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['openDialog', 'update:dialog', 'addHeuris', 'change'])

const { t } = useI18n()
const toast = useToast()

const id = ref(0)
const localDialog = ref(false)
const localHeuris = ref({ title: '', questions: [], total: 0 })
const form = ref(null)
const nameRequired = ref([(v) => !!v || t('HeuristicsTable.validation.nameRequired')])
const questionRequired = ref([(v) => !!v || t('HeuristicsTable.validation.questionRequired')])

// Watchers
watch(
  () => props.dialog,
  (newVal) => {
    localDialog.value = newVal
    if (newVal) {
      localHeuris.value = cloneDeep(props.heuris)
    }
  }
)

watch(
  () => props.heuris,
  (newVal) => {
    if (!localDialog.value) {
      localHeuris.value = cloneDeep(newVal)
    }
  },
  { deep: true }
)

// Methods
const addQuestion = () => {
  if (localHeuris.value.questions.length > 0) {
    id.value = localHeuris.value.questions[localHeuris.value.questions.length - 1].id + 1
  } else {
    id.value = 0
  }
  localHeuris.value.questions.push({ id: id.value, text: '' })
  localHeuris.value.total = localHeuris.value.questions.length
}

const removeQuestion = (index) => {
  localHeuris.value.questions.splice(index, 1)
  localHeuris.value.total = localHeuris.value.questions.length
}

const validate = async () => {
  const { valid } = await form.value.validate()
  if (valid) {
    if (localHeuris.value.questions.length === 0) {
      toast.info(t('HeuristicsTable.validation.addQuestion'))
    } else {
      emit('update:dialog', false)
      emit('addHeuris', cloneDeep(localHeuris.value))
      emit('change')
      resetVal()
    }
  }
}

const resetVal = () => {
  localHeuris.value = { title: '', questions: [], total: 0 }
  form.value.resetValidation()
}

const updateDialog = (value) => {
  localDialog.value = value
  emit('update:dialog', value)
}

const closeDialog = () => {
  emit('update:dialog', false)
  resetVal()
}
</script>

<style scoped>
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
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
</style>