<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-expansion-panels
          v-if="items.length > 0"
          style="z-index: auto; border-radius: 20px; border: 1px solid rgba(249, 152, 38, 0.49);"
        >
          <v-expansion-panel
            v-for="(item, i) in items"
            :key="i"
            style="border-radius: 20px;"
          >
            <v-expansion-panel-title>
              {{ items[i].title }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-form>
                <v-text-field
                  v-model="items[i].title"
                  label="Title"
                  @change="saveState()"
                />
                <v-text-field
                  v-model="items[i].description"
                  label="Description"
                  @click:append="log"
                  @change="saveState()"
                />
                <div>
                  <v-text-field
                    v-for="(field, index) in items[i].selectionFields"
                    :key="index"
                    v-model="items[i].selectionFields[index]"
                    :label="$t('UserTestTable.inputs.selection')"
                    @change="saveState"
                  >
                    <template #append>
                      <v-icon @click="newSelection(i)">
                        mdi-plus
                      </v-icon>
                      <v-icon @click="deleteSelection(i)">
                        mdi-trash-can
                      </v-icon>
                    </template>
                  </v-text-field>
                  <div
                    v-if="
                      items[i].selectionField &&
                        items[i].selectionFields.length === 0
                    "
                  >
                    <p>
                      Add first option<v-icon
                        class="ml-1"
                        @click="newSelection(i)"
                      >
                        mdi-plus
                      </v-icon>
                    </p>
                  </div>
                </div>
              </v-form>
              <v-row>
                <v-col
                  :cols="6"
                  class="checkbox-container"
                >
                  <v-checkbox
                    v-model="items[i].selectionField"
                    :label="$t('UserTestTable.checkboxes.selectionField')"
                    @update:model-value="saveState"
                    @click="selectField(i)"
                  />
                </v-col>
                <v-col
                  :cols="5"
                  class="checkbox-container"
                >
                  <v-checkbox
                    v-model="items[i].textField"
                    :label="$t('UserTestTable.checkboxes.textField')"
                    @click="selectText(i)"
                  />
                </v-col>
                <v-col>
                  <v-btn
                    class="mt-5"
                    icon
                    @click="deleteItem(i)"
                  >
                    <v-icon>mdi-trash-can</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        
        <v-card
          class="mt-2"
          rounded="xl"
          border
          elevation="0"
          color="grey-lighten-2"
          @click="showModal"
        >
          <p class="text-subtitle-1 text-center ma-2">
            <v-icon>mdi-plus-circle</v-icon>
            {{ $t('UserTestTable.buttons.createNewVariable') }}
          </p>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="show"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title class="text-h6 mb-2">
          {{
            $t('UserTestTable.buttons.createNewVariable')
          }}
        </v-card-title>
        
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-text-field
              v-model="newItem"
              variant="filled"
              :rules="[(newItem) => !!newItem || 'This Name field is required']"
              color="orange"
              :label="$t('UserTestTable.inputs.variableName')"
              @change="saveState"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-btn
            color="red"
            class="ml-auto"
            @click="closeModal"
          >
            <v-icon class="mr-1">
              mdi-close
            </v-icon>
            {{ $t('buttons.close') }}
          </v-btn>
          <v-btn
            color="orange"
            @click="saveNewItem"
          >
            <v-icon class="mr-1">
              mdi-content-save
            </v-icon>
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
import { useI18n } from 'vue-i18n'

const store = useStore()
const { t } = useI18n()

const newItem = ref('')
const items = ref([])
const show = ref(false)
const valid = ref(false)
const form = ref(null)

const test = computed(() => store.getters.test)
const preTest = computed(() => store.getters.preTest)

const log = () => {
  console.log('adicionar + 1')
}

const showModal = () => {
  show.value = true
}

const closeModal = () => {
  show.value = false
  form.value?.resetValidation()
}

const selectField = (i) => {
  if (items.value[i].selectionFields.length === 0 && items.value[i].selectionField) {
    items.value[i].selectionFields.push('')
  }
  if (!items.value[i].selectionField) {
    items.value[i].selectionFields = []
  }
  items.value[i].textField = false
}

const selectText = (i) => {
  if (items.value[i].selectionFields.length > 0) {
    items.value[i].selectionFields = []
  }
  items.value[i].selectionField = false
}

const deleteItem = (i) => {
  items.value.splice(i, 1)
}

const saveNewItem = () => {
  if (newItem.value.trim() !== '') {
    items.value.push({
      answer: '',
      title: newItem.value,
      description: '',
      selectionFields: [],
      selectionField: false,
      textField: true,
    })
    newItem.value = ''
    show.value = false
    form.value?.resetValidation()
    saveState()
  } else {
    form.value?.validate()
  }
}

const newSelection = (index) => {
  items.value[index] = {
    ...items.value[index],
    selectionFields: [...items.value[index].selectionFields, ''],
  }
}

const deleteSelection = (index) => {
  items.value[index].selectionFields.splice(
    items.value[index].selectionFields.length - 1,
    1
  )
}

const saveState = () => {
  store.dispatch('setPreTest', items.value)
}

const getVariables = () => {
  if (test.value.testStructure.preTest) {
    items.value = test.value.testStructure.preTest
  } else if (preTest.value) {
    items.value = preTest.value
  }
}

onMounted(() => {
  getVariables()
})
</script>

<style scoped>
@media (max-width: 600px) {
  .checkbox-container {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
  }
  .v-row {
    flex-direction: column;
  }
  .v-btn.mt-5 {
    margin-top: 0 !important;
  }
}
</style>