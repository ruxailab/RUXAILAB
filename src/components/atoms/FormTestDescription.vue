<template>
  <v-form ref="form">
    <v-row justify="space-around" class="pa-2">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="test.testTitle"
          :autofocus="lock ? false : true"
          :label="$t('common.title')"
          :rules="titleRequired"
          counter="100"
          outlined
          dense
          @input="$store.commit('SET_LOCAL_CHANGES', true)"
        />
        <v-select
          v-model="test.testType"
          :disabled="lock"
          :items="types"
          :label="$t('common.type')"
          :rules="typeRequired"
          dense
          outlined
        />
      </v-col>
      <v-col cols="12" md="5">
        <v-textarea
          v-model="test.testDescription"
          :label="$t('common.description')"
          outlined
          dense
          @input="$store.commit('SET_LOCAL_CHANGES', true)"
        />
        <v-checkbox
          v-model="test.isPublic"
          :label="$t('pages.createTest.public')"
          color="#F9A826"
          @change="$store.commit('SET_LOCAL_CHANGES', true)"
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
  data: () => ({
    titleRequired: [
      (v) => !!v || i18n.t('errors.fieldRequired'),
      (v) => (v && v.length <= 100) || 'Max 100 characters',
    ],
    typeRequired: [(v) => !!v || i18n.t('errors.fieldRequired')],
    types: [
      // { text: "Usability User Test", value: "User" },
      { text: i18n.t('titles.heuristic'), value: 'HEURISTICS' },
    ],
  }),
  methods: {
    valida() {
      const valid = this.$refs.form.validate()
      this.$emit('valForm', valid, 0)
      return valid
    },
    resetVal() {
      this.$refs.form.resetValidation() //used on emits
    },
  },
}
</script>

<style></style>
