<template>
  <v-container fluid class="pa-0 bg-grey-lighten-5">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="12">
        <v-card class="elevation-2 rounded-lg pa-6">
          <v-card-title
            class="text-h5 font-weight-bold mb-4"
            :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
          >
            {{
              type === 'pre-test'
                ? $t('ModeratedTest.preTestVariables')
                : $t('ModeratedTest.postTestVariables')
            }}
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-6" style="color: #4b5563">
              {{ $t('ModeratedTest.configureVariables', { type: type }) }}
            </p>
            <v-expansion-panels
              v-if="items.length > 0"
              variant="accordion"
              class="elevation-0"
              style="border: 1px solid #e5e7eb; border-radius: 12px"
            >
              <v-expansion-panel
                v-for="(item, i) in items"
                :key="i"
                class="rounded-lg mb-2"
                :disabled="isSaving"
              >
                <v-expansion-panel-title class="py-3 px-4">
                  <span class="text-body-1 font-weight-medium">{{
                    item.title || 'Untitled Variable'
                  }}</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-4">
                  <v-form @submit.prevent>
                    <v-text-field
                      v-model="item.title"
                      :label="$t('UserTestTable.inputs.variableName')"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || $t('errors.fieldRequired')]"
                      color="primary"
                      class="mb-4"
                      @update:model-value="markDirty"
                    />
                    <v-textarea
                      v-model="item.description"
                      :label="$t('UserTestTable.inputs.description')"
                      variant="outlined"
                      density="comfortable"
                      color="primary"
                      rows="3"
                      class="mb-4"
                      @update:model-value="markDirty"
                    />
                    <div v-if="item.selectionField">
                      <div
                        v-for="(field, index) in item.selectionFields"
                        :key="index"
                        class="d-flex align-center mb-2"
                      >
                        <v-text-field
                          v-model="item.selectionFields[index]"
                          :label="
                            $t('UserTestTable.inputs.selection') +
                            ` ${index + 1}`
                          "
                          variant="outlined"
                          density="comfortable"
                          :rules="[(v) => !!v || $t('errors.fieldRequired')]"
                          color="primary"
                          class="mr-2"
                          @update:model-value="markDirty"
                        >
                          <template #append>
                            <v-icon
                              color="accent"
                              class="mr-2"
                              @click="newSelection(i)"
                            >
                              mdi-plus-circle
                            </v-icon>
                            <v-icon
                              v-if="item.selectionFields.length > 1"
                              color="error"
                              @click="deleteSelection(i, index)"
                            >
                              mdi-trash-can-outline
                            </v-icon>
                          </template>
                        </v-text-field>
                      </div>
                      <div
                        v-if="item.selectionFields.length === 0"
                        class="text-body-2 mb-4"
                      >
                        <span>{{
                          $t('UserTestTable.messages.noOptions')
                        }}</span>
                        <v-btn
                          variant="text"
                          color="accent"
                          class="text-capitalize"
                          @click="newSelection(i)"
                        >
                          <v-icon start> mdi-plus </v-icon>
                          {{ $t('UserTestTable.buttons.addFirstOption') }}
                        </v-btn>
                      </div>
                    </div>
                    <v-row align="center" class="mt-2">
                      <v-col cols="12" sm="6">
                        <v-checkbox
                          v-model="item.selectionField"
                          :label="$t('UserTestTable.checkboxes.selectionField')"
                          color="primary"
                          @update:model-value="selectField(i), markDirty()"
                        />
                      </v-col>
                      <v-col cols="12" sm="5">
                        <v-checkbox
                          v-model="item.textField"
                          :label="$t('UserTestTable.checkboxes.textField')"
                          color="primary"
                          @update:model-value="selectText(i), markDirty()"
                        />
                      </v-col>
                      <v-col cols="12" sm="1" class="text-right">
                        <v-btn icon color="error" @click="deleteItem(i)">
                          <v-icon>mdi-trash-can-outline</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-alert
              v-else
              type="info"
              icon="mdi-information-outline"
              class="mt-4 rounded-lg"
              :text="$t('UserTestTable.messages.noVariables')"
            />
          </v-card-text>
          <v-card-actions>
            <v-card
              class="border-dashed text-center py-6"
              width="100%"
              variant="outlined"
              style="
                cursor: pointer;
                border-style: dashed !important;
                border-color: #d1d5db;
              "
              @click="showModal"
            >
              <v-card-text>
                <v-icon icon="mdi-plus-circle" size="24" class="mb-2" />
                <div class="text-body-1">
                  {{ $t('UserTestTable.buttons.createNewVariable') }}
                </div>
              </v-card-text>
            </v-card>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- New Variable Dialog -->
    <v-dialog
      v-model="show"
      max-width="600"
      persistent
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-lg pa-6">
        <v-card-title
          class="text-h6 font-weight-bold mb-4"
          :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
        >
          {{ $t('ModeratedTest.createNewVariableTitle') }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="newItem"
              :label="$t('UserTestTable.inputs.variableName')"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v.trim() || $t('errors.fieldRequired')]"
              color="primary"
              @update:model-value="markDirty"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            variant="outlined"
            class="px-6"
            @click="closeModal"
          >
            <v-icon start> mdi-close </v-icon>
            {{ $t('buttons.close') }}
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            class="px-6"
            :disabled="!valid || isSaving"
            :loading="isSaving"
            @click="saveNewItem"
          >
            <v-icon start> mdi-content-save </v-icon>
            {{ $t('buttons.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits(['update', 'change'])

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})

const store = useStore()

const newItem = ref('')
const items = ref([])
const show = ref(false)
const valid = ref(false)
const form = ref(null)
const isSaving = ref(false)
const isDirty = ref(false)

const test = computed(() => store.getters.test)

const markDirty = () => {
  isDirty.value = true
  emit('change')
  emit('update', items.value)
}

const showModal = () => {
  show.value = true
  newItem.value = ''
  form.value?.resetValidation()
}

const closeModal = () => {
  show.value = false
  newItem.value = ''
  form.value?.resetValidation()
}

const selectField = (i) => {
  if (
    items.value[i].selectionField &&
    items.value[i].selectionFields.length === 0
  ) {
    items.value[i].selectionFields.push('')
  }
  if (!items.value[i].selectionField) {
    items.value[i].selectionFields = []
  }
  items.value[i].textField = false
  markDirty()
}

const selectText = (i) => {
  items.value[i].selectionFields = []
  items.value[i].selectionField = false
  markDirty()
}

const deleteItem = (i) => {
  items.value.splice(i, 1)
  saveState()
}

const newSelection = (index) => {
  items.value[index] = {
    ...items.value[index],
    selectionFields: [...items.value[index].selectionFields, ''],
  }
  markDirty()
}

const deleteSelection = (index, selectionIndex) => {
  items.value[index].selectionFields.splice(selectionIndex, 1)
  markDirty()
}

const saveNewItem = async () => {
  if (!valid.value) return await form.value?.validate()

  try {
    isSaving.value = true
    items.value.push({
      answer: '',
      title: newItem.value.trim(),
      description: '',
      selectionFields: [],
      selectionField: false,
      textField: true,
    })
    newItem.value = ''
    show.value = false
    form.value?.resetValidation()
    saveState()
  } catch (error) {
    return error
  } finally {
    isSaving.value = false
  }
}

const saveState = async () => {
  try {
    isSaving.value = true
    emit('update', items.value)
    emit('change')
    isDirty.value = false
  } catch (error) {
    return error
  } finally {
    isSaving.value = false
  }
}

const getVariables = () => {
  if (props.type === 'pre-test') {
    items.value = test.value?.testStructure?.preTest ?? []
  } else if (props.type === 'post-test') {
    items.value = test.value?.testStructure?.postTest ?? []
  }
  emit('update', items.value)
}

onMounted(() => {
  getVariables()
})
</script>

<style scoped>
.v-expansion-panel {
  transition: all 0.3s ease;
}

.v-expansion-panel-title {
  background-color: #ffffff;
}

.v-expansion-panel-text {
  background-color: #f8fafc;
}

.v-btn {
  text-transform: none;
  letter-spacing: 0;
}

.checkbox-container {
  padding: 8px;
}

@media (max-width: 600px) {
  .checkbox-container {
    flex: 0 0 100%;
  }

  .v-row:not(.align-center) {
    flex-direction: column;
  }
}
</style>
