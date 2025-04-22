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

<script>
import i18n from '@/i18n'

export default {
  props: {
    test: {
      type: Object,
      required: true,
    },
    lock: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:test', 'valForm'],
  data: () => ({
    titleRequired: [
      (v) => !!v || i18n.global.t('errors.fieldRequired'),
      (v) => (v && v.length <= 200) || 'Max 200 characters',
    ],
    typeRequired: [(v) => !!v || i18n.global.t('errors.fieldRequired')],
    types: [
      { text: 'Usability User Test', value: 'User' },
      { text: i18n.global.t('titles.heuristic'), value: 'HEURISTICS' },
    ],
  }),
  methods: {
    validate() {
      const valid = this.$refs.form.validate()
      this.$emit('valForm', valid, 0)
      return valid
    },
    resetVal() {
      this.$refs.form.resetValidation()
    },
    updateTestTitle(value) {
      this.$emit('update:test', { ...this.test, testTitle: value })
      this.$store.commit('SET_LOCAL_CHANGES', true)
    },
    updateTestDescription(value) {
      this.$emit('update:test', { ...this.test, testDescription: value })
      this.$store.commit('SET_LOCAL_CHANGES', true)
    },
    updateTestPublic(value) {
      this.$emit('update:test', { ...this.test, isPublic: value })
      this.$store.commit('SET_LOCAL_CHANGES', true)
    },
  },
}
</script>

<style></style>