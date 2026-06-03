<template>
  <PageWrapper :title="$t('EvaluatorInfoView.pageTitle')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('EvaluatorInfoView.pageSubtitle') }}
      </p>
    </template>

    <v-container>
      <EvaluatorInfoEditor @autosave="save" />
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import EvaluatorInfoEditor from '@/ux/Heuristic/components/EvaluatorInfoEditor.vue'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'

const store = useStore()
const route = useRoute()
const { t } = useI18n()

const save = async () => {
  const rawData = {
    ...store.getters.test,
    testStructure: store.getters.heuristics,
    testOptions: store.state.Tests.Test.testOptions,
    testWeights: store.getters.testWeights,
  }

  const study = instantiateStudyByType(rawData.testType, rawData)
  await store.dispatch('updateStudy', study)
  await store.dispatch('getStudy', { id: route.params.id })
}
</script>
