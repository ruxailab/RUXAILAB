<template>
  <v-form ref="form">
    <v-row
      justify="space-around"
      class="pa-2"
    >
      <v-col
        cols="12"
        md="5"
      >
        <v-text-field
          :model-value="test.testTitle"
          :autofocus="lock ? false : true"
          :label="$t('common.title')"
          :rules="titleRequired"
          counter="200"
          variant="outlined"
          density="compact"
          @update:model-value="updateTestTitle($event)"
        />
        <v-select
          :model-value="test.testType"
          :disabled="lock"
          :items="types"
          :label="$t('common.type')"
          :rules="typeRequired"
          density="compact"
          variant="outlined"
          @update:model-value="$emit('update:test', { ...test, testType: $event })"
        />
      </v-col>
      <v-col
        cols="12"
        md="5"
      >
        <v-textarea
          :model-value="test.testDescription"
          :label="$t('common.description')"
          variant="outlined"
          density="compact"
          @update:model-value="updateTestDescription($event)"
        />
        <v-checkbox
          :value="test.isPublic"
          :label="$t('pages.createTest.public')"
          color="#F9A826"
          @input="updateTestPublic($event)"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

// Props
defineProps({
  test: {
    type: Object,
    required: true,
  },
  lock: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:test', 'valForm'])

// Store
const store = useStore()

// i18n
const { t } = useI18n()

// Form reference
const form = ref(null)

// Validation rules
const titleRequired = [
  (v) => !!v || t('errors.fieldRequired'),
  (v) => (v && v.length <= 200) || 'Max 200 characters',
]
const typeRequired = [(v) => !!v || t('errors.fieldRequired')]

// Select options
const types = [
  { text: 'Usability User Test', value: 'User' },
  { text: t('titles.heuristic'), value: 'HEURISTICS' },
]

// Methods
const valida = async () => {
  const { valid } = await form.value.validate()
  emit('valForm', valid, 0)
  return valid
}

const resetVal = () => {
  form.value.resetValidation()
}

const updateTestTitle = (value) => {
  emit('update:test', { ...test, testTitle: value })
  store.commit('SET_LOCAL_CHANGES', true)
}

const updateTestDescription = (value) => {
  emit('update:test', { ...test, testDescription: value })
  store.commit('SET_LOCAL_CHANGES', true)
}

const updateTestPublic = (value) => {
  emit('update:test', { ...test, isPublic: value })
  store.commit('SET_LOCAL_CHANGES', true)
}

// Expose methods for external use
defineExpose({
  valida,
  resetVal,
})
</script>

<style></style>